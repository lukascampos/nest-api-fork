import { Module } from '@nestjs/common';
import { CreateArtisanModule } from './create-artisan/create-artisan.module';

@Module({
  imports: [CreateArtisanModule],
})
export class ArtisanModule {}
