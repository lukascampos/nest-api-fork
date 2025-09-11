import {
  Controller, Post, Body, UseGuards,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { PendingApplicationAlreadyExistsError } from '../../core/errors/pending-application-already-exists.error';
import { UserAlreadyArtisanError } from '../../core/errors/user-already-artisan.error';
import { UserNotFoundError } from '../../core/errors/user-not-found.error';
import { InitiateArtisanApplicationUseCase } from '../../core/use-cases/initiate-artisan-application.use-case';
import { InitiateArtisanApplicationDto } from '../dtos/initiate-artisan-application-dto';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard)
export class InitiateArtisanApplicationController {
  constructor(
    private readonly initiateArtisanApplicationUseCase: InitiateArtisanApplicationUseCase,
  ) {}

  @Post('initiate')
  async handle(
    @Body() body: InitiateArtisanApplicationDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.initiateArtisanApplicationUseCase.execute({
      userId: currentUser.sub,
      wantsToCompleteNow: body.wantsToCompleteNow,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case PendingApplicationAlreadyExistsError:
          throw new ConflictException(error.message);
        case UserAlreadyArtisanError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
