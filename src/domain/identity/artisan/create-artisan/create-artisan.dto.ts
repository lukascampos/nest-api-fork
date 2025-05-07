import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArtisanDto {
  @IsString()
  @IsNotEmpty()
    rawMaterial: string;

  @IsString()
  @IsNotEmpty()
    technique: string;

  @IsString()
  @IsNotEmpty()
    finalityClassification: string;

  @IsString()
  @IsNotEmpty()
    sicab: string;

  @IsNotEmpty()
    sisabRegistrationDate: string;

  @IsNotEmpty()
    sisabValidUntil: string;
}
