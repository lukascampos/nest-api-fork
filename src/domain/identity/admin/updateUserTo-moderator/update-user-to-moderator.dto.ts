import {
  Equals, IsNotEmpty, IsString,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserToModeratorDto {
  @IsNotEmpty()
  @IsString()
    userId: string;

  @IsNotEmpty()
  @Equals(Role.MODERATOR, { message: 'Only MODERATOR role is allowed.' })
    newRole: Role[] = [];
}
