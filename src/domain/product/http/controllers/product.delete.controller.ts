import {
  Controller, Delete, Param, UseGuards, ForbiddenException, NotFoundException, ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/domain/_shared/auth/jwt/jwt-auth.guard';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Roles } from '@/domain/_shared/auth/decorators/roles.decorator';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { UserPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UserRole } from '@/domain/identity/core/entities/user.entity';
import { DeactivateProductUseCase } from '@/domain/product/core/use-cases/deactivate-product.use-case';
import { ProductIdParamDto } from '@/domain/product/http/dtos/product-id-param.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { NotAllowedError } from '../../core/errors/not-allowed.error';
import { ProductAlreadyInactiveError } from '../../core/errors/product-already-inactive.error';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeleteProductController {
  constructor(private readonly deleteProductUseCase: DeactivateProductUseCase) {}

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ARTISAN)
  async handle(@Param() { id } : ProductIdParamDto, @CurrentUser() user: UserPayload) {
    const result = await this.deleteProductUseCase.execute({
      productId: id,
      requesterId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof NotAllowedError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof ProductAlreadyInactiveError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    return { message: 'Product deleted successfully' };
  }
}
