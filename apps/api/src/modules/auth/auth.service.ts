import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';
import { JWT_EXPIRES_IN, REFRESH_SECRET, REFRESH_EXPIRES_IN } from '../../common/auth.config';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(tenantId: bigint, dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    type?: string; // "user", "therapist", "admin"
  }) {
    const email = dto.email.toLowerCase().trim();
    const username = (dto.username || email.split('@')[0]).toLowerCase().trim();

    // Check if user profile already exists for this tenant
    const existingProfile = await this.prisma.profile.findFirst({
      where: { tenantId, email },
    });
    if (existingProfile?.userId) {
      throw new BadRequestException('An account with this email already exists in this practice');
    }
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create or find underlying User
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });
    }

    const isTherapist = dto.type === 'therapist';
    const profile = existingProfile
      ? await this.prisma.profile.update({
          where: { id: existingProfile.id },
          data: {
            userId: existingProfile.userId || user.id,
            username: existingProfile.username || username,
            firstName: dto.firstName ?? existingProfile.firstName,
            lastName: dto.lastName ?? existingProfile.lastName,
            type: dto.type || existingProfile.type || 'user',
            status: 'active',
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        })
      : await this.prisma.profile.create({
          data: {
            tenantId,
            userId: user.id,
            email,
            username,
            firstName: dto.firstName,
            lastName: dto.lastName,
            type: dto.type || 'user',
            status: 'active',
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

    // If therapist, create ConsultTherapistProfile
    if (isTherapist) {
      await this.prisma.consultTherapistProfile.create({
        data: {
          tenantId,
          profileId: profile.id,
          publicUsername: username,
          bookingEmail: email,
          notificationEmail: email,
          isPublic: true,
          acceptsGeneralBooking: true,
          isVerified: true,
        },
      });
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      profile.id,
      tenantId,
      profile.type,
    );

    return {
      accessToken,
      refreshToken,
      profile: {
        id: profile.id.toString(),
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        type: profile.type,
        status: profile.status,
      },
    };
  }

  async loginPlatformAdmin(dto: { email: string; password: string }) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.platformRole) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generatePlatformAdminTokens(user, user.platformRole);
    return {
      accessToken,
      refreshToken,
      profile: this.platformAdminProfile(user),
    };
  }

  async login(tenantId: bigint, dto: { email: string; password: string }) {    const email = dto.email.toLowerCase().trim();

    const profile = await this.prisma.profile.findFirst({
      where: { tenantId, email },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (profile.status === 'inactive') {
      throw new UnauthorizedException('Your account has been deactivated. Please contact your administrator.');
    }

    const passwordValid = await bcrypt.compare(dto.password, profile.user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      profile.user.id,
      profile.id,
      tenantId,
      profile.type,
    );

    return {
      accessToken,
      refreshToken,
      profile: {
        id: profile.id.toString(),
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        type: profile.type,
        status: profile.status,
        avatarUrl: profile.avatarUrl,
      },
    };
  }

  async getPlatformAdminStatus(userId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.platformRole) throw new NotFoundException('Session profile not found');
    return this.platformAdminProfile(user);
  }

  async getSessionStatus(profileId: bigint) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { consultTherapistProfile: true },
    });

    if (!profile) throw new NotFoundException('Session profile not found');

    return {
      id: profile.id.toString(),
      tenantId: profile.tenantId.toString(),
      email: profile.email,
      username: profile.username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      type: profile.type,
      status: profile.status,
      avatarUrl: profile.avatarUrl,
      isTherapist: !!profile.consultTherapistProfile,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type === 'platform_admin') {
      const user = await this.prisma.user.findUnique({ where: { id: BigInt(payload.sub) } });
      if (!user || !user.platformRole) {
        throw new UnauthorizedException('Session is no longer valid');
      }
      const { accessToken, refreshToken: nextRefreshToken } = this.generatePlatformAdminTokens(
        user,
        user.platformRole,
      );
      return {
        accessToken,
        refreshToken: nextRefreshToken,
        profile: this.platformAdminProfile(user),
      };
    }

    if (!payload.profileId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: BigInt(payload.profileId) },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const { accessToken, refreshToken: nextRefreshToken } = this.generateTokens(
      profile.user.id,
      profile.id,
      profile.tenantId,
      profile.type,
    );

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      profile: {
        id: profile.id.toString(),
        email: profile.email,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        type: profile.type,
        status: profile.status,
        avatarUrl: profile.avatarUrl,
      },
    };
  }

  private generateTokens(userId: bigint, profileId: bigint, tenantId: bigint, type: string) {
    const payload: JwtPayload = {
      sub: userId.toString(),
      profileId: profileId.toString(),
      tenantId: tenantId.toString(),
      type,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = this.jwtService.sign(payload, {
      secret: REFRESH_SECRET,
      expiresIn: REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private generatePlatformAdminTokens(
    user: { id: bigint; email: string },
    platformRole: string,
  ) {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      type: 'platform_admin',
      roles: [platformRole],
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = this.jwtService.sign(payload, {
      secret: REFRESH_SECRET,
      expiresIn: REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private platformAdminProfile(user: {
    id: bigint;
    email: string;
    username: string | null;
    platformRole: string | null;
  }) {
    return {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      type: 'platform_admin',
      platformRole: user.platformRole,
      status: 'active',
    };
  }
}
