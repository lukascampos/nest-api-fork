import {
  Controller, UseGuards, Post, Param, Body,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ApplicationAlreadySubmittedError } from '../../core/errors/application-already-submitted.error';
import { ApplicationNotFoundError } from '../../core/errors/application-not-found.error';
import { InvalidAttachmentError } from '../../core/errors/invalid-attachment.error';
import { UnauthorizedApplicationAccessError } from '../../core/errors/unauthorized-application-access.error';
import { CompleteArtisanApplicationUseCase } from '../../core/use-cases/complete-artisan-application.use-case';
import { CompleteArtisanApplicationDto } from '../dtos/complete-artisan-application.dto';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard)
export class CompleteArtisanApplicationController {
  constructor(
    private readonly completeArtisanApplicationUseCase: CompleteArtisanApplicationUseCase,
  ) {}

  @Post(':id/complete')
  async handle(
    @Param('id') applicationId: string,
    @Body() body: CompleteArtisanApplicationDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.completeArtisanApplicationUseCase.execute({
      userId: currentUser.sub,
      applicationId,
      data: {
        ...body,
        sicabRegistrationDate: new Date(body.sicabRegistrationDate),
        sicabValidUntil: new Date(body.sicabValidUntil),
      },
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ApplicationNotFoundError:
          throw new NotFoundException(error.message);
        case UnauthorizedApplicationAccessError:
          throw new ForbiddenException(error.message);
        case ApplicationAlreadySubmittedError:
          throw new BadRequestException(error.message);
        case InvalidAttachmentError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException('Erro ao completar solicitação');
      }
    }

    return result.value;
  }
}
