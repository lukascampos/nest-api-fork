import {
  Controller, Post, Patch, Param, Body,
  UseGuards, ConflictException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { RequestDisableArtisanUseCase } from '../../core/use-cases/request-disable-artisan.use-case';
import { ReviewDisableArtisanUseCase } from '../../core/use-cases/review-disable-artisan.use-case';
import { ReviewDisableArtisanDto } from '../dtos/disable-artisan.dto';
import { PendingDisableRequestAlreadyExistsError } from '../../core/errors/pending-disable-request-already-exists.error';
import { ArtisanProfileNotFoundError } from '../../core/errors/artisan-profile-not-found.error';
import { ArtisanApplicationNotFoundError } from '../../core/errors/artisan-application-not-found.error';
import { ArtisanApplicationAlreadyModeratedError } from '../../core/errors/artisan-application-already-moderated.error';
import { PropertyMissingError } from '../../core/errors/property-missing.error';

@Controller('artisan-applications')
export class DisableArtisanController {
  constructor(
    private readonly requestUseCase: RequestDisableArtisanUseCase,
    private readonly reviewUseCase: ReviewDisableArtisanUseCase,
  ) {}

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async request(@CurrentUser() user: UserPayload) {
    const result = await this.requestUseCase.execute({ userId: user.sub });
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof PendingDisableRequestAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof ArtisanProfileNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return { message: 'Solicitação de desativação enviada com sucesso' };
  }

  @Patch('disable/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewDisableArtisanDto,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.reviewUseCase.execute({
      applicationId: id,
      reviewerId: user.sub,
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    });
    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ArtisanApplicationNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ArtisanApplicationAlreadyModeratedError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof PropertyMissingError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error.message);
    }
    return { message: 'Solicitação de desativação analisada com sucesso' };
  }
}
