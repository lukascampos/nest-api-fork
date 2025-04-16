import { Body, Controller, Post, Get } from '@nestjs/common';
import { ListUserService } from './list-user.service';

@Controller('users')
export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async findAll() {
    return this.listUserService.findAll();
  }
}
