import { Module } from '@nestjs/common';
import { UpdateUserToModeratorService } from './updateUserTo-moderator.service';
import { UpdateUserToModeratorController } from './updateUserTo-moderator.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [UpdateUserToModeratorController],
  providers: [UpdateUserToModeratorService, PrismaService],
})
export class UpdateUserToModeratorModule {}
