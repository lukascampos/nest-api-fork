import { Module } from '@nestjs/common';
import { CreateArtisanController } from './create-artisan.controller';
import { CreateArtisanService } from './create-artisan.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CreateArtisanController],
  providers: [CreateArtisanService, PrismaService],
})
export class CreateArtisanModule {}
