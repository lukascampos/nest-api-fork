import { Module } from '@nestjs/common';
import { UpdateUserProfileInfoController } from './update-user-profile-info.controller';
import { UpdateUserProfileInfoService } from './update-user-profile-info.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [UpdateUserProfileInfoController],
  providers: [UpdateUserProfileInfoService, PrismaService],
})
export class UpdateUserProfileInfoModule {}
