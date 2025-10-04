import {
  BadRequestException, Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { Public } from '@/domain/_shared/auth/decorators/public.decorator';
import { ListProductsUseCase } from '../../core/use-cases/list-products.use-case';
import { ListProductsDto } from '../dtos/list-products.dto';

@Controller('products')
@UseGuards(RolesGuard)
export class ListProductsController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  @Get()
  @Public()
  async handle(
    @Query() query: ListProductsDto,
  ) {
    const result = await this.listProductsUseCase.execute({ ...query });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
