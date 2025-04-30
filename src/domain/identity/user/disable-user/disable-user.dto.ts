import { IsUUID } from 'class-validator';

export class DisableUserDto {
  @IsUUID()
    userId: string;
}
