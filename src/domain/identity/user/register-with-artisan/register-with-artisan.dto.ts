import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArtisanDto } from '../../artisan/create-artisan/create-artisan.dto';
import { CreateAccountDto } from '../../http/dtos/create-account.dto';

export class RegisterWithArtisanDto {
  @ValidateNested()
  @Type(() => CreateAccountDto)
    user: CreateAccountDto;

  @ValidateNested()
  @Type(() => CreateArtisanDto)
    artisan: CreateArtisanDto;
}
