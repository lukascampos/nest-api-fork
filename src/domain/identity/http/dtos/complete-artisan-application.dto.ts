import {
  IsString,
  IsArray,
  IsDateString,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CompleteArtisanApplicationDto {
  @IsArray({ message: 'Matérias-primas devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Pelo menos uma matéria-prima deve ser selecionada' })
  @ArrayMaxSize(10, { message: 'Máximo de 10 matérias-primas permitidas' })
  @IsString({ each: true, message: 'Cada matéria-prima deve ser um texto' })
  @MinLength(2, { each: true, message: 'Cada matéria-prima deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { each: true, message: 'Cada matéria-prima deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.map((v: string) => v?.trim()))
    rawMaterial: string[];

  @IsArray({ message: 'Técnicas devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Pelo menos uma técnica deve ser selecionada' })
  @ArrayMaxSize(10, { message: 'Máximo de 10 técnicas permitidas' })
  @IsString({ each: true, message: 'Cada técnica deve ser um texto' })
  @MinLength(2, { each: true, message: 'Cada técnica deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { each: true, message: 'Cada técnica deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.map((v: string) => v?.trim()))
    technique: string[];

  @IsArray({ message: 'Classificações de finalidade devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Pelo menos uma classificação de finalidade deve ser selecionada' })
  @ArrayMaxSize(10, { message: 'Máximo de 10 classificações de finalidade permitidas' })
  @IsString({ each: true, message: 'Cada classificação de finalidade deve ser um texto' })
  @MinLength(2, { each: true, message: 'Cada classificação deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { each: true, message: 'Cada classificação deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.map((v: string) => v?.trim()))
    finalityClassification: string[];

  @IsString({ message: 'Nome de usuário do artesão deve ser um texto' })
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(30, { message: 'Nome de usuário deve ter no máximo 30 caracteres' })
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Nome de usuário deve conter apenas letras minúsculas, números e underscore',
  })
  @Transform(({ value }) => value?.toLowerCase().trim())
    artisanUserName: string;

  @IsString({ message: 'Nome comercial deve ser um texto' })
  @MinLength(2, { message: 'Nome comercial deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome comercial deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
    comercialName: string;

  @IsString({ message: 'CEP deve ser um texto' })
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve estar no formato 00000-000' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
    zipCode: string;

  @IsString({ message: 'Endereço deve ser um texto' })
  @MinLength(3, { message: 'Endereço deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
  @Transform(({ value }) => value?.trim())
    address: string;

  @IsString({ message: 'Número do endereço deve ser um texto' })
  @MaxLength(10, { message: 'Número do endereço deve ter no máximo 10 caracteres' })
  @Transform(({ value }) => value?.trim())
    addressNumber: string;

  @IsString({ message: 'Complemento deve ser um texto' })
  @MaxLength(100, { message: 'Complemento deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
    addressComplement: string;

  @IsString({ message: 'Bairro deve ser um texto' })
  @MinLength(2, { message: 'Bairro deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Bairro deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
    neighborhood: string;

  @IsString({ message: 'Cidade deve ser um texto' })
  @MinLength(2, { message: 'Cidade deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
    city: string;

  @IsString({ message: 'Estado deve ser um texto' })
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)' })
  @Transform(({ value }) => value?.toUpperCase().trim())
    state: string;

  @IsString({ message: 'Bio deve ser um texto' })
  @MinLength(10, { message: 'Bio deve ter pelo menos 10 caracteres' })
  @MaxLength(500, { message: 'Bio deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
    bio: string;

  @IsArray({ message: 'IDs das fotos devem ser uma lista' })
  @ArrayMaxSize(20, { message: 'Máximo de 20 fotos permitidas' })
  @IsUUID('4', { each: true, message: 'Cada ID de foto deve ser um UUID válido' })
    photosIds: string[];

  @IsString({ message: 'Número SICAB deve ser um texto' })
  @MinLength(5, { message: 'Número SICAB deve ter pelo menos 5 caracteres' })
  @MaxLength(50, { message: 'Número SICAB deve ter no máximo 50 caracteres' })
  @Transform(({ value }) => value?.trim())
    sicab: string;

  @IsDateString()
    sicabRegistrationDate: string;

  @IsDateString()
    sicabValidUntil: string;
}
