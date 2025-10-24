import { IsBoolean } from 'class-validator';

export class InitiateArtisanApplicationDto {
  @IsBoolean()
    wantsToCompleteNow: boolean;
}
