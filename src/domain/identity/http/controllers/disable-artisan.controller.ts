/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller, Post, Patch, Req, Body, UseGuards, HttpException, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { RequestDisableArtisanUseCase } from '../../core/use-cases/request-disable-artisan.use-case';
import { ReviewDisableArtisanUseCase } from '../../core/use-cases/review-disable-artisan.use-case';
import { ReviewDisableArtisanRequestDto } from '../dtos/disable-artisan.dto';
import { UserRole } from '../../core/entities/user.entity';

@Controller('artisans')
export class DisableArtisanController {
  constructor(
    private readonly requestUseCase: RequestDisableArtisanUseCase,
    private readonly reviewUseCase: ReviewDisableArtisanUseCase,
  ) {}

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any) {
    try {
      return await this.requestUseCase.execute(req.user.userId);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async review(@Body() dto: ReviewDisableArtisanRequestDto, @Req() req: any) {
    try {
      return await this.reviewUseCase.execute({
        id: dto.id,
        reviewerId: req.user.userId,
        status: dto.status,
        rejectionReason: dto.rejectionReason,
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
