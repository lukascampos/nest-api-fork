import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { ApplicationNotFoundError } from '../../core/errors/application-not-found.error';
import { GetArtisanApplicationDetailsUseCase } from '../../core/use-cases/get-artisan-application-details.use-case';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard)
export class GetArtisanApplicationDetailsController {
  constructor(
    private readonly getArtisanApplicationDetailsUseCase: GetArtisanApplicationDetailsUseCase,
  ) {}

  @Get(':id')
  @Roles(PrismaRoles.MODERATOR)
  async handleOwn(
    @Param('id') applicationId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const result = await this.getArtisanApplicationDetailsUseCase.execute({
      applicationId,
      userId: currentUser.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ApplicationNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
