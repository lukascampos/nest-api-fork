import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserToModeratorDto {
  @IsNotEmpty()
  @IsString()
    userId: string;

  @IsNotEmpty()
  @IsString()
    newRole: string;
}
