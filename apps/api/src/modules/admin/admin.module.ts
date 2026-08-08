import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformAdminGuard } from './platform-admin.guard';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, PlatformAdminGuard, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
