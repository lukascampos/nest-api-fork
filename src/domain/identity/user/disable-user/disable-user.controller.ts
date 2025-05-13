import {
  Controller, UseGuards, Patch, Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
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
