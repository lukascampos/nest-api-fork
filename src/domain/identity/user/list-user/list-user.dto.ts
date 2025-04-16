import {
  IsEmail, IsMobilePhone, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ListUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
    name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
    socialName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
    cpf: string;

  @IsEmail()
  @IsNotEmpty()
    email: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
    password: string;

  @IsNotEmpty()
    dtBirth: string;

  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('pt-BR')
  @IsPhoneNumber('BR')
    phone: string;
}
