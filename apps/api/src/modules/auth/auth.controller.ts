import { Controller, Post, Get, Body, Req, Res, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TenantRequest } from '../../common/middleware/tenant.middleware';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  CSRF_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
  cookieOptions,
  csrfCookieOptions,
} from '../../common/auth.config';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account (Client or Therapist)' })
  async register(
    @Req() req: TenantRequest,
    @Body() dto: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.tenantId) throw new Error('Practice tenant context required');
    const result = await this.authService.register(req.tenantId, dto);
    this.setSessionCookies(res, result.accessToken, result.refreshToken);
    return { profile: result.profile };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Req() req: TenantRequest,
    @Body() dto: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.tenantId) throw new Error('Practice tenant context required');
    const result = await this.authService.login(req.tenantId, dto);
    this.setSessionCookies(res, result.accessToken, result.refreshToken);
    return { profile: result.profile };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the access token using the refresh cookie' })
  async refresh(@Req() req: TenantRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('No refresh token provided');
    const result = await this.authService.refresh(refreshToken);
    this.setSessionCookies(res, result.accessToken, result.refreshToken);
    return { profile: result.profile };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear the session cookies' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_COOKIE, cookieOptions(0));
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(0), path: '/v1/auth/refresh' });
    res.clearCookie(CSRF_COOKIE, { ...csrfCookieOptions(), maxAge: 0 });
    return { success: true };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current session profile status' })
  getStatus(@Req() req: any) {
    return this.authService.getSessionStatus(BigInt(req.user.profileId || req.user.userId));
  }

  private setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie(REFRESH_COOKIE, refreshToken, {
      ...cookieOptions(REFRESH_COOKIE_MAX_AGE),
      path: '/v1/auth/refresh',
    });
    res.cookie(CSRF_COOKIE, randomBytes(32).toString('hex'), csrfCookieOptions());
  }
}
