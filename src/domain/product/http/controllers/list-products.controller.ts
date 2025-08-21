import {
  BadRequestException, Controller, Get, NotFoundException, Query, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { ListProductsUseCase } from '../../core/use-cases/list-products.use-case';
import { ListProductsQueryDto } from '../dtos/list-products-query.dto';

@Controller('products')
@UseGuards(RolesGuard)
export class ListProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  @Get()
  @Public()
  async handle(
    @Query() query: ListProductsQueryDto,
  ) {
    const result = await this.listProductsUseCase.execute({ ...query });

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
