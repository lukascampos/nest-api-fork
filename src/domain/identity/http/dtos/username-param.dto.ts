import { IsString } from 'class-validator';

export class UsernameParamDto {
  @IsString()
    username: string;
}
