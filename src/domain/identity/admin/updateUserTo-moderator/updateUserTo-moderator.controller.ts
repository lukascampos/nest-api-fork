import {
  Body, Controller, Patch, UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UpdateUserToModeratorService } from './updateUserTo-moderator.service';
import { UpdateUserToModeratorDto } from './updateUserTo-moderator.dto';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { RolesGuard } from '@/domain/auth/roles/roles.guard';
import { Roles } from '@/domain/auth/roles/roles.decorator';

@Controller('/moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UpdateUserToModeratorController {
  constructor(
     private readonly updateUserToModerator: UpdateUserToModeratorService,
  ) { }

  @Patch()
  @Roles(Role.ADMIN)
  handle(@Body() body: UpdateUserToModeratorDto) {
    return this.updateUserToModerator.updateUserRole(body);
  }
}
