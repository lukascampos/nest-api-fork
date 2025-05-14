import { Module } from '@nestjs/common';
import { CreateUserController } from './create-user.controller';
import { CreateUserService } from './create-user.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CreateUserController],
  providers: [CreateUserService, PrismaService],
})
export class CreateUserModule {}
