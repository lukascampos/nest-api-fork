import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArtisanDto } from '../../artisan/create-artisan/create-artisan.dto';
import { CreateUserDto } from '../create-user/create-user.dto';

export class RegisterWithArtisanDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
    user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateArtisanDto)
    artisan: CreateArtisanDto;
}
