import {
  IsNotEmpty, IsOptional, IsString, Matches,
} from 'class-validator';

export class UpdateUserProfileInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+(?:\s+\S+)+$/, {
    message: 'name must be the full name',
  })
    name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+(?:\s+\S+)+$/, {
    message: 'social name must be the full name',
  })
    socialName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
    phone?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
    avatar?: string;
}
