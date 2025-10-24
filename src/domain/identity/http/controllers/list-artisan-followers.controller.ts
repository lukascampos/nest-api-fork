import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { ListArtisanFollowersUseCase } from '../../core/use-cases/list-artisan-followers.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { TargetNotArtisanError } from '../../core/errors/target-not-artisan.error';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ListArtisanFollowersController {
  constructor(
        private readonly listArtisanFollowersUseCase: ListArtisanFollowersUseCase,
  ) {}

  @Get(':id/followers')
  @HttpCode(200)
  async handle(
    @Param('id') artisanId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Number(page);
    const l = Number(limit);

    const result = await this.listArtisanFollowersUseCase.execute({
      artisanId,
      page: p,
      limit: l,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case TargetNotArtisanError:
          throw new ForbiddenException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }
    const { followers, pagination } = result.value;

    return {
      data: {
        followers,
        pagination,
      },
    };
  }
}
