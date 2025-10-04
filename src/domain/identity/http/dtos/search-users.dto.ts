import {
  IsOptional, IsString, IsEnum, IsUUID, IsEmail, IsInt, Min, Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Roles } from '@prisma/client';

export class ListUsersQueryDto {
  @IsOptional()
  @IsUUID(4, { message: 'ID deve ser um UUID válido' })
    id?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
    cpf?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
    search?: string;

  @IsOptional()
  @IsEnum(Roles, { message: 'Role deve ser válida' })
    role?: Roles;

  @IsOptional()
  @IsEnum(['active', 'disabled'], { message: 'Status deve ser active ou disabled' })
    status?: 'active' | 'disabled';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior que 0' })
    page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit deve ser um número inteiro' })
  @Min(1, { message: 'Limit deve ser maior que 0' })
  @Max(100, { message: 'Limit máximo é 100' })
    limit?: number = 10;

  @IsOptional()
  @IsEnum(['name', 'email', 'createdAt'], { message: 'Campo de ordenação inválido' })
    sortBy?: 'name' | 'email' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Ordem deve ser asc ou desc' })
    sortOrder?: 'asc' | 'desc' = 'desc';
}
