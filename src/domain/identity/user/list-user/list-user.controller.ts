import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListUserService } from './list-user.service';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { Request } from 'express';



@Controller('users')
@UseGuards(JwtAuthGuard)

export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async handle(@Req() req: Request) {
    const {id, role} = req.user as { id: string; role: string }
    return this.listUserService.findAll({ id, role });
  }
}
