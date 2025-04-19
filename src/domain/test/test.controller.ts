import {
  Controller, Get, UseGuards, Req,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { TestService } from './test.service';
import { RolesGuard } from '@/shared/roles/roles.guard';
import { Roles } from '@/shared/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

    @Get()
  getLivre(): string {
    return this.testService.getLivre();
  }

    @Get('admin')
    @Roles(Role.ADMIN)
    getAdmin(): string {
      return this.testService.getAdmin();
    }

    @Get('artisan')
    @Roles(Role.ARTISAN, Role.ADMIN)
    getArtisan(@Req() req:Request): string {
      console.log(req);
      return this.testService.getArtisan();
    }

    @Get('mix')
    @Roles(Role.ARTISAN)
    getMix(): string {
      return this.testService.getMisto();
    }
}
