import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ListArtisanFollowingUseCase } from '../../core/use-cases/list-artisan-following.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ListUserFollowingController {
  constructor(
        private readonly listArtisanFollowingUseCase: ListArtisanFollowingUseCase,
  ) {}

  @Get('following')
  @HttpCode(200)
  async handle(
    @CurrentUser() currentuser: TokenPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Number(page);
    const l = Number(limit);

    const result = await this.listArtisanFollowingUseCase.execute({
      userId: currentuser.sub,
      page: p,
      limit: l,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    const { following, pagination } = result.value;

    return {
      data: { following, pagination },
    };
  }
}
