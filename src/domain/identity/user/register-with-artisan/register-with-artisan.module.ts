import { Module } from '@nestjs/common';
import { RegisterWithArtisanController } from './register-with-artisan.controller';
import { RegisterWithArtisanService } from './register-with-artisan.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateUserService } from '../create-user/create-user.service';
import { CreateArtisanService } from '../../artisan/create-artisan/create-artisan.service';

@Module({
  imports: [],
  controllers: [RegisterWithArtisanController],
  providers: [RegisterWithArtisanService, CreateUserService, CreateArtisanService, PrismaService],
})
export class RegisterWithArtisanModule {}
