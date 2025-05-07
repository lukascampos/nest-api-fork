import { IsString, IsUUID } from 'class-validator';
import { CreateArtisanDto } from './create-artisan.dto';

export class CreateArtisanInteralDto extends CreateArtisanDto {
  @IsString()
  @IsUUID()
    userId: string;
}
