import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
} from 'class-validator';

export class UpdatePersonalProfileDataDto {
  // Dados pessoais (comuns a todos os usuários)
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
    name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nome social deve ter no máximo 100 caracteres' })
    socialName?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX',
  })
    phone?: string;

  @IsOptional()
  @IsString()
    avatarId?: string;

  // Dados específicos do artesão (opcionais, só processados se user.roles.includes('ARTISAN'))
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(50, { message: 'Nome de usuário deve ter no máximo 50 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Nome de usuário pode conter apenas letras, números, hífen e underscore',
  })
    artisanUserName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Biografia deve ter no máximo 1000 caracteres' })
    bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'SICAB é obrigatório' })
  @MaxLength(50, { message: 'SICAB deve ter no máximo 50 caracteres' })
    sicab?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de registro SICAB deve ser uma data válida' })
    sicabRegistrationDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data de validade SICAB deve ser uma data válida' })
    sicabValidUntil?: string;
}
