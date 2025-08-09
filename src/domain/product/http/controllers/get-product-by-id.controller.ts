import {
  BadRequestException, Controller, Get, NotFoundException, Param, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { GetProductByIdUseCase } from '../../core/use-cases/get-product-by-id.use-case';
import { ProductIdParamDto } from '../dtos/product-id-param.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';

@Controller('products/:id')
@UseGuards(RolesGuard)
export class GetProductByIdController {
  constructor(
    private readonly getProductById: GetProductByIdUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ARTISAN)
  async handle(
    @CurrentUser() artisan: UserPayload,
    @Param() param: ProductIdParamDto,
  ) {
    const result = await this.getProductById.execute({ ...param });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
