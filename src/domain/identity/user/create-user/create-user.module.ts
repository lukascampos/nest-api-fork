import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateUserController } from './create-user.controller';
import { CreateUserService } from './create-user.service';

@Module({
  imports: [],
  controllers: [CreateUserController],
  providers: [CreateUserService, PrismaService],
})
export class CreateUserModule {}
