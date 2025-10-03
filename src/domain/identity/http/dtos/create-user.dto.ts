import {
  IsEmail, IsString, MinLength, IsOptional, IsStrongPassword, IsMobilePhone, MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

  @IsString({ message: 'Senha deve ser um texto' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, {
    message: 'Senha deve ter pelo menos 8 caracteres, incluindo: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  })
    password: string;

  @IsString({ message: 'Nome deve ser um texto' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @Transform(({ value }) => value?.trim())
    name: string;

  @IsOptional()
  @IsString({ message: 'Nome social deve ser um texto' })
  @Transform(({ value }) => value?.trim())
    socialName?: string;

  @IsString({ message: 'Telefone deve ser um texto' })
  @IsMobilePhone('pt-BR', {}, { message: 'Telefone deve ser um número válido brasileiro' })
    phone: string;

  @IsOptional()
  @IsString({ message: 'CPF deve ser um texto' })
  @MinLength(11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @MaxLength(11, { message: 'CPF deve ter exatamente 11 dígitos' })
    cpf?: string;
}
