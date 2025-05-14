import {
  Body, Controller, Post,
} from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { CreateAccountDto } from '../../http/dtos/create-account.dto';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

export class CreateUserController {
  constructor(
    private readonly createUser: CreateUserService,
  ) { }

  // @Post()
  // @Public()
  // handle(@Body() body: CreateAccountDto) {
  //   const {
  //     password, email, cpf, birthDate, name, phone, socialName,
  //   } = body;

  //   return this.createUser.execute({
  //     password, email, cpf, birthDate, name, phone, socialName,
  //   });
  // }
}
