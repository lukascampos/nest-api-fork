import {
  Controller, UseGuards, Get, Query, BadRequestException,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { GetAllArtisanApplicationsUseCase } from '../../core/use-cases/get-all-artisan-applications.use-case';
import { GetAllArtisanApplicationsQueryDto } from '../dtos/get-all-artisan-applications.dto';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('artisan-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GetAllArtisanApplicationsController {
  constructor(
    private getAllArtisanApplicationsUseCase: GetAllArtisanApplicationsUseCase,
  ) {}

  @Get()
  @Roles(PrismaRoles.ADMIN, PrismaRoles.MODERATOR)
  async handle(@Query() query: GetAllArtisanApplicationsQueryDto) {
    const {
      type, status, formStatus, search,
    } = query;

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    const result = await this.getAllArtisanApplicationsUseCase.execute({
      type,
      status,
      formStatus,
      page,
      limit,
      search,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    return result.value;
  }
}
