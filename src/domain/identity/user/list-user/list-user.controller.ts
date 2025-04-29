import { Controller, Get } from '@nestjs/common';
import { Roles } from '@/domain/auth/roles/roles.decorator';
import { ListUserService } from './list-user.service';
import { UserPayload } from '@/domain/auth/jwt.strategy';
import { Role } from '@prisma/client';
import { CurrentUser } from '@/domain/auth/current-user.decorator';

@Controller('users')
export class ListUserController {
  constructor(private readonly listUserService: ListUserService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER, Role.ARTISAN)
  async handle(@CurrentUser() user: UserPayload) {
    return this.listUserService.findAll(user)
  }
}
