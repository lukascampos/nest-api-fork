import {
  Controller,
  Post,
  Param,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';

import { ToggleArtisanFollowUseCase } from '../../core/use-cases/toggle-artisan-follow.usecase';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { CannotFollowSelfError } from '../../core/errors/cannot-follow-self.error';
import { TargetNotArtisanError } from '../../core/errors/target-not-artisan.error';

@Controller('artisans')
@UseGuards(JwtAuthGuard)
export class ToggleArtisanFollowController {
  constructor(
    private readonly toggleArtisanFollowUseCase: ToggleArtisanFollowUseCase,
  ) {}

  @Post(':id/follow')
  @HttpCode(200)
  async handle(
    @Param('id') artisanId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.toggleArtisanFollowUseCase.execute({
      followerId: currentUser.sub,
      followingId: artisanId,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case CannotFollowSelfError:
          throw new BadRequestException(error.message);
        case TargetNotArtisanError:
          throw new ForbiddenException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    const { action, followersCount } = result.value;

    return {
      data: {
        message:
          action === 'followed'
            ? 'Usuário passou a seguir o artesão'
            : 'Usuário deixou de seguir o artesão',
        followersCount,
      },
    };
  }
}
