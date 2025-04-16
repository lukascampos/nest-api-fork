import { Module } from '@nestjs/common';
import { ListUserController as ListUserController } from './list-user.controller';
import { ListUserService } from './list-user.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [ListUserController],
  providers: [ListUserService, PrismaService],
})
export class ListUser {}
