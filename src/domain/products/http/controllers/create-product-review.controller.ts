import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateProductReviewUseCase } from '../../core/use-cases/create-product-review.use-case';
import { RolesGuard } from '@/domain/_shared/auth/roles/roles.guard';
import { CurrentUser } from '@/domain/_shared/auth/decorators/current-user.decorator';
import { TokenPayload } from '@/domain/_shared/auth/jwt/jwt.strategy';
import { CreateOrUpdateReviewDto } from '../dtos/create-or-update-review.dto';
import { InvalidRatingError } from '../../core/errors/invalid-rating.error';
import { OperationNotAllowedError } from '../../core/errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';
import { ReviewAlreadyExistsError } from '../../core/errors/review-already-exists.error';

@Controller('products/:id/reviews')
@UseGuards(RolesGuard)
export class CreateProductReviewController {
  constructor(private readonly useCase: CreateProductReviewUseCase) {}

  @Post()
  async handle(
    @Param('id') productId: string,
    @CurrentUser() user: TokenPayload,
    @Body() body: CreateOrUpdateReviewDto,
  ) {
    const result = await this.useCase.execute({
      currentUserId: user.sub,
      productId,
      rating: body.rating,
      comment: body.comment ?? null,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        case OperationNotAllowedError:
          throw new ForbiddenException(error.message);
        case InvalidRatingError:
          throw new BadRequestException(error.message);
        case ReviewAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return result.value;
  }
}
