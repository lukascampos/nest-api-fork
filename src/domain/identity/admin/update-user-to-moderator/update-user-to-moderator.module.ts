import { Module } from '@nestjs/common';
import { UpdateUserToModeratorService } from './update-user-to-moderator.service';
import { UpdateUserToModeratorController } from './update-user-to-moderator.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [UpdateUserToModeratorController],
  providers: [UpdateUserToModeratorService, PrismaService],
})
export class UpdateUserToModeratorModule {}
