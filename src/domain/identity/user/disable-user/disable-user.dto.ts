import { IsUUID } from 'class-validator';

export class DisableUserDto {
  @IsUUID('all', { message: 'User ID must be a valid UUID' })
    userId: string;
}
