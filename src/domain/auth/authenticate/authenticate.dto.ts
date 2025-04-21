import {
  IsEmail, IsNotEmpty, IsString, IsStrongPassword,
} from 'class-validator';

export class AuthenticateDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
    email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  @IsString()
    password: string;
}
