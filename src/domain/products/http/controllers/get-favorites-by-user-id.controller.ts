import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { GetFavoritesByUserIdUseCase } from '../../core/use-cases/get-favorites-by-user-id.use-case';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { UserNotFoundError } from '@/domain/identity/core/errors/user-not-found.error';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';

@Controller('users')
export class GetFavoritesByUserIdController {
  constructor(
    private readonly getFavoritesByUserIdUseCase: GetFavoritesByUserIdUseCase,
  ) {}

  @Get('my-favorites')
  async handle(
    @Param('userId') param: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const result = await this.getFavoritesByUserIdUseCase.execute({
      userId: user.sub,
      page: query.page,
      limit: query.limit,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException('Erro interno do servidor');
      }
    }

    const { products, pagination } = result.value;

    return {
      message: 'Produtos favoritos recuperados com sucesso',
      data: {
        products,
        pagination,
      },
    };
  }
}
