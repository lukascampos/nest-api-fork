import { Module } from '@nestjs/common';
import { DisableUserController } from './disable-user.controller';
import { DisableUserService } from './disable-user.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [DisableUserController],
  providers: [DisableUserService, PrismaService],
})
export class DisableUserModule {}
