import { Module } from '@nestjs/common';
import { CreateArtisanController } from './create-artisan.controller';
import { CreateArtisanService } from './create-artisan.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CreateArtisanController],
  providers: [CreateArtisanService, PrismaService],
})
<<<<<<< HEAD
export class CreateArtisanModule { }
=======
export class CreateArtisanModule {}
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
