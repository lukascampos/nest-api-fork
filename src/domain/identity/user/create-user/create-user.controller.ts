import {
  Body, Controller, Post,
} from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { CreateUserDto } from './create-user.dto';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';

@Controller('/users')
export class CreateUserController {
  constructor(
    private readonly createUser: CreateUserService,
  ) { }

  @Post()
  @Public()
  handle(@Body() body: CreateUserDto) {
    const {
      password, email, cpf, birthDate, name, phone, socialName,
    } = body;

    return this.createUser.execute({
      password, email, cpf, birthDate, name, phone, socialName,
    });
  }
}
