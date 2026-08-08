import { Module } from '@nestjs/common';
import { ConsultController } from './consult.controller';
import { ConsultService } from './consult.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [ConsultController],
  providers: [ConsultService, PrismaService],
  exports: [ConsultService],
})
export class ConsultModule {}
