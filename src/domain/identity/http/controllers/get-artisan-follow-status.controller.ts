import {
  Controller,
  Get,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { GetArtisanFollowStatusUseCase } from '../../core/use-cases/get-artisan-follow-status.use-case';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { TargetNotArtisanError } from '../../core/errors/target-not-artisan.error';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class GetArtisanFollowStatusController {
  constructor(
        private readonly getArtisanFollowStatusUseCase: GetArtisanFollowStatusUseCase,
  ) {}

  @Get(':id/follow/status')
  @HttpCode(200)
  async handle(
    @Param('id') artisanId: string,
    @CurrentUser() currentuser: TokenPayload,
  ) {
    const result = await this.getArtisanFollowStatusUseCase.execute({
      currentUserId: currentuser.sub,
      artisanId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case TargetNotArtisanError:
          throw new ForbiddenException(error.message);
        default:
          throw new InternalServerErrorException('An unexpected error occurred');
      }
    }

    const { isFollowing, followersCount, followedAt } = result.value;

    return {
      data: {
        isFollowing: !!isFollowing,
        followersCount,
        followedAt,
      },
    };
  }
}
