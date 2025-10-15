import {
  IsOptional, IsString, MinLength, MaxLength,
  IsMobilePhone,
} from 'class-validator';

export class UpdatePersonalProfileDataDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome social deve ter no máximo 100 caracteres' })
    socialName?: string | null;

  @IsString({ message: 'Telefone deve ser um texto' })
  @IsMobilePhone('pt-BR', {}, { message: 'Telefone deve ser um número válido brasileiro' })
    phone: string;

  @IsOptional()
  @IsString()
    avatarId?: string;
}
