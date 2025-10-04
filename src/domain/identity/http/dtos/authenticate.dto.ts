import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthenticateDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

  @IsString({ message: 'Senha deve ser um texto' })
  @MinLength(1, { message: 'Senha é obrigatória' })
    password: string;
}
