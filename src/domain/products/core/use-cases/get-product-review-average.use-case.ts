import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ceil1 } from '@/domain/_shared/utils/number.utils';

type Input = { productId: string };
type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class GetProductReviewAverageUseCase {
  private readonly logger = new Logger(GetProductReviewAverageUseCase.name);

  constructor(
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    this.logger.debug({ event: 'start', productId: input.productId });

    try {
      const product = await this.productsRepo.findByIdCore(input.productId);
      if (!product) return left(new ProductNotFoundError(input.productId));

      const { avg, count } = await this.reviewsRepo.aggregateByProduct(input.productId);
      const out: Output = { averageRating: ceil1(avg ?? 0), totalReviews: count };

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        productId: input.productId,
        averageRating: out.averageRating,
        totalReviews: out.totalReviews,
      });
      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        err: error.message,
        stack: error.stack,
      });
      return left(error);
    }
  }
}
