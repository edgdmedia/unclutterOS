import { Module } from '@nestjs/common';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [IntakeController],
  providers: [IntakeService, PrismaService],
  exports: [IntakeService],
})
export class IntakeModule {}
