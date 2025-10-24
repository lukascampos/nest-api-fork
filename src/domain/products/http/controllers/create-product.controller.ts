import {
  BadRequestException, Body, Controller, NotFoundException, Post, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { CreateProductUseCase } from '../../core/use-cases/create-product.use-case';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateProductDto } from '../dtos/create-product.dto';
import { InvalidProductDataError } from '../../core/errors/invalid-product-data.error';

@Controller('products')
@UseGuards(RolesGuard)
export class CreateProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
  ) {}

  @Post()
  @Roles(PrismaRoles.ARTISAN)
  async handle(
    @CurrentUser() artisan: TokenPayload,
    @Body() body: CreateProductDto,
  ) {
    const result = await this.createProductUseCase.execute({ ...body, artisanId: artisan.sub });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        case InvalidProductDataError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return result.value;
  }
}
