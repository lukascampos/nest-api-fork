import { Module } from '@nestjs/common';
import { AuthenticateService } from './authenticate.service';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateDto } from './authenticate.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AuthenticateController],
  providers: [AuthenticateService, AuthenticateDto, PrismaService],
})
export class AuthenticateModule {}
