import {
  Controller, UseGuards, Patch, Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { RolesGuard } from '@/domain/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/auth/current-user.decorator';
import { UserPayload } from '@/domain/auth/jwt.strategy';
import { DisableUserService } from './disable-user.service';
import { DisableUserDto } from './disable-user.dto';

@Controller('users/:userId/disable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisableUserController {
  constructor(private readonly disableUserService: DisableUserService) {}

  @Patch()
  async handle(
    @Param() param: DisableUserDto,
    @CurrentUser() userPayload: UserPayload,
  ) {
    return this.disableUserService.disableUser(param.userId, userPayload);
  }
}
