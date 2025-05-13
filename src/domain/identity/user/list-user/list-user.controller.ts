import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListUserService } from './list-user.service';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    return this.listUserService.execute(user);
  }
}
