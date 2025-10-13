import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { GetArtisanProfileByUsernameUseCase } from '../../core/use-cases/get-artisan-profile-by-username.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';

@Controller('artisan-profiles/:username')
@UseGuards(JwtAuthGuard)
export class GetArtisanProfileByUsernameController {
  constructor(
    private readonly getArtisanProfileByUsername: GetArtisanProfileByUsernameUseCase,
  ) {}

  @Get()
  async handleOwn(
    @Param('username') username: string,
  ) {
    const result = await this.getArtisanProfileByUsername.execute({
      username,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
