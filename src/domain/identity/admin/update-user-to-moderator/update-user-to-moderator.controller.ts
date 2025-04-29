import {
  Controller, Param, Patch, UseGuards,
} from '@nestjs/common';
import { UpdateUserToModeratorService } from './update-user-to-moderator.service';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { RolesGuard } from '@/domain/auth/roles/roles.guard';
import { UpdateUserToModeratorDto } from './update-user-to-moderator.dto';

@Controller('admin/:userId/add-moderator-role')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateUserToModeratorController {
  constructor(
    private readonly updateUserToModerator: UpdateUserToModeratorService,
  ) { }

  @Patch()
  handle(@Param() param: UpdateUserToModeratorDto) {
    return this.updateUserToModerator.updateUserRole(param.userId);
  }
}
