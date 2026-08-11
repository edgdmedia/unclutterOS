import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { CsrfGuard } from './csrf.guard';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../common/auth.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRES_IN },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    CsrfGuard,
    { provide: APP_GUARD, useClass: CsrfGuard },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
