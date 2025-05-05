<<<<<<< HEAD
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

    @IsNotEmpty()
    @IsString()
      sicab: string;

    @IsNotEmpty()
      sisabRegistrationDate: string;

    @IsNotEmpty()
      sisabValidUntil: string;
=======
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

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

  @IsDateString()
  @IsNotEmpty()
    sisabRegistrationDate: string;

  @IsDateString()
  @IsNotEmpty()
    sisabValidUntil: string;
>>>>>>> 02056ddc10d5566d3993c49fe2417ba999ca94f0
}
