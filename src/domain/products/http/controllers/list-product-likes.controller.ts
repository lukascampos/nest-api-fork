import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ListProductLikesUseCase } from '../../core/use-cases/list-product-likes.use-case';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { ListLikesQueryDto } from '../dtos/list-likes-query.dto';

@Controller('products')
export class ListProductLikesController {
  constructor(
    private readonly listProductLikesUseCase: ListProductLikesUseCase,
  ) {}

  @Get(':id/likes')
  async handle(
    @Param('id') productId: string,
    @Query() query: ListLikesQueryDto,
  ) {
    const result = await this.listProductLikesUseCase.execute({
      productId,
      page: query.page,
      limit: query.limit,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    return {
      data: result.value,
    };
  }
}
