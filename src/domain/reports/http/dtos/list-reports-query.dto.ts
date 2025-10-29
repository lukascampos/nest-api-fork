import { Transform, Type } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ListReportsQueryDto {
  @IsOptional()
  @IsBooleanString({ message: 'Campo "isSolved" deve ser booleano (true/false)' })
    isSolved?: string;

  @IsOptional()
  @IsUUID(4, { message: 'ID do autor da denúncia é inválido' })
    reporterId?: string;

  @IsOptional()
  @IsIn(['product', 'productRating', 'user'], { message: 'Tipo de alvo é inválido' })
    targetType?: 'product' | 'productRating' | 'user';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Take deve ser um número inteiro' })
  @Min(1, { message: 'Take deve ser no mínimo 1' })
  @Max(100, { message: 'Take deve ser no máximo 100' })
    take?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Skip deve ser um número inteiro' })
  @Min(0, { message: 'Skip não pode ser negativo' })
    skip?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    _: unknown;
}
