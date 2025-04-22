import {
  Body,
  Controller, Param, Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/auth/current-user.decorator';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { UserPayload } from '@/domain/auth/jwt.strategy';
import { UpdateUserProfileInfoService } from './update-user-profile-info.service';
import { UpdateUserProfileInfoDto } from './update-user-profile-infor.dto';

@Controller('users/:id')
@UseGuards(JwtAuthGuard)
export class UpdateUserProfileInfoController {
  constructor(
    private readonly updateUserProfileInfo: UpdateUserProfileInfoService,
  ) {}

  @Put()
  async handle(
    @CurrentUser() userId: UserPayload,
    @Param('id') id: string,
    @Body() body: UpdateUserProfileInfoDto,
  ) {
    if (userId.sub !== id) {
      throw new UnauthorizedException('You cannot edit anothers people profile');
    }

    await this.updateUserProfileInfo.execute({ ...body, userId: userId.sub });
  }
}
