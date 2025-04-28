import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListUserService } from './list-user.service';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { Request } from 'express';
import {Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)

export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async handle(@Req() req: Request) {
     const { id, role } = req.user as { id: string; role: Role };
    return this.listUserService.findAll({ id , role});
  }
}
