import {
  BadRequestException, Body, Controller, NotFoundException, Param, Put, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ProductIdParamDto } from '../dtos/product-id-param.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdateProductUseCase } from '../../core/use-cases/update-product.use-case';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';

@Controller('products/:id')
@UseGuards(RolesGuard)
export class UpdateProductController {
  constructor(
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Put()
  @Roles(UserRole.ARTISAN)
  async handle(
    @Param() param: ProductIdParamDto,
    @CurrentUser() user: UserPayload,
    @Body() body: UpdateProductDto,
  ) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Invalid request body');
    }

    const result = await this.updateProductUseCase.execute({
      productId: param.id,
      authorId: user.sub,
      ...body,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
