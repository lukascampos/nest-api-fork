import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { CreateUserDto } from './create-user.dto';

@Controller('/users')
export class CreateUserController {
  constructor(
    private readonly createUser: CreateUserService,
    private readonly createUserDto: CreateUserDto,
  ) { }

  @Post()
  handle(@Body() body: CreateUserDto) {
    const { password, email } = body;

    return this.createUser.execute({ password, email });
  }
}
