import {
  Controller,
  UseGuards,
  Patch,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ModerateArtisanApplicationUseCase } from '../../core/use-cases/moderate-artisan-application.use-case';
import { ModerateArtisanApplicationDto } from '../dtos/moderate-artisan-application.dto';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerateArtisanApplicationController {
  constructor(
    private moderateArtisanApplicationUseCase: ModerateArtisanApplicationUseCase,
  ) {}

  @Patch(':id/moderate')
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(
    @Param('id') id: string,
    @Body() body: ModerateArtisanApplicationDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const { status, rejectionReason } = body;
    const reviewerId = user.sub;

    const result = await this.moderateArtisanApplicationUseCase.execute({
      applicationId: id,
      status,
      rejectionReason,
      reviewerId,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return { message: 'Solicitação moderada com sucesso' };
  }
}
