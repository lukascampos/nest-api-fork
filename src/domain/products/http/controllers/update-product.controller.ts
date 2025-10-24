import {
  BadRequestException, Body, Controller, NotFoundException, Param, Put, UseGuards,
} from '@nestjs/common';
import { Roles as PrismaRoles } from '@prisma/client';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ProductIdParamDto } from '../dtos/product-id-param.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UpdateProductUseCase } from '../../core/use-cases/update-product.use-case';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UpdateProductDto } from '../dtos/update-product-dto';

@Controller('products/:id')
@UseGuards(RolesGuard)
export class UpdateProductController {
  constructor(
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Put()
  @Roles(PrismaRoles.ARTISAN)
  async handle(
    @Param() param: ProductIdParamDto,
    @CurrentUser() user: TokenPayload,
    @Body() body: UpdateProductDto,
  ) {
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Invalid request body');
    }

    const updateBody = { ...body };

    if (updateBody.coverPhotoId === '' || updateBody.coverPhotoId === null) {
      updateBody.coverPhotoId = undefined;
    }

    const result = await this.updateProductUseCase.execute({
      productId: param.id,
      authorId: user.sub,
      ...updateBody,
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
