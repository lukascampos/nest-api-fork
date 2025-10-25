import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { GetProductLikeStatusUseCase } from '../../core/use-cases/get-product-like-status.use-case';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';

@Controller('products')
export class GetProductLikeStatusController {
  constructor(
    private readonly getProductLikeStatusUseCase: GetProductLikeStatusUseCase,
  ) {}

  @Get(':id/like/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PrismaRoles.USER)
  async handle(@Param('id') productId: string, @CurrentUser() user: TokenPayload) {
    const result = await this.getProductLikeStatusUseCase.execute({
      productId,
      userId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    const data = result.value;
    return {
      data,
    };
  }
}
