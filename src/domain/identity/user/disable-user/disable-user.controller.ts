import { Controller, UseGuards, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { RolesGuard } from '@/domain/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/auth/current-user.decorator';
import { UserPayload } from '@/domain/auth/jwt.strategy';
import { DisableUserService } from './disable-user.service';
import { DisableUserDto } from './disable-user.dto';

@Controller('/disable-user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisableUserController {
 constructor( private readonly disableUserService: DisableUserService ){}

  @Patch()
  async handle(
    @Body() dto: DisableUserDto,
    @CurrentUser() userId: UserPayload,
    ) {
    return this.disableUserService.disableUser(dto, userId);
    }
}
