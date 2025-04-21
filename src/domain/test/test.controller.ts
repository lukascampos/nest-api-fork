import {
  Controller, Get, UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TestService } from './test.service';
import { RolesGuard } from '@/shared/roles/roles.guard';
import { Roles } from '@/shared/roles/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user-decorator';
import { UserPayload } from '../auth/jwt.strategy';
import { Public } from '../auth/public.decorator';

@Controller('test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @Public()
  getLivre(): string {
    return this.testService.getLivre();
  }

  @Get('me')
  getMe(@CurrentUser() user: UserPayload) {
    return {
      id: user.sub,
      role: user.role,
    };
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  getAdmin() {
    return this.testService.getAdmin();
  }

  @Get('artisan')
  @Roles(Role.ARTISAN, Role.ADMIN)
  getArtisan(): string {
    return this.testService.getArtisan();
  }

  @Get('mix')
  @Roles(Role.ARTISAN)
  getMix(): string {
    return this.testService.getMisto();
  }
}
