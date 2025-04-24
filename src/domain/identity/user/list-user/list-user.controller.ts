import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListUserService } from './list-user.service';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { Request } from 'express';
import {Role } from '@prisma/client'; // Importando o tipo Role do Prisma

@Controller('users')
@UseGuards(JwtAuthGuard)

export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async handle(@Req() req: Request) {
    // const {id, role} = req.user as { id: string; role: string };
    console.log(req.user);
     const { sub, role } = req.user as { sub: string; role: Role };
    return this.listUserService.findAll({ id: sub, role});
  }
}
