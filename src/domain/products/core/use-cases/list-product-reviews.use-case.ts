import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

type Input = { productId: string; page?: number; limit?: number };
type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { id: string; name: string; avatar: string | null };
};
type Output = {
  reviews: ReviewItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

@Injectable()
export class ListProductReviewsUseCase {
  private readonly logger = new Logger(ListProductReviewsUseCase.name);

  constructor(
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    const page = Number(input.page ?? 1);
    const limit = Math.min(Number(input.limit ?? 10), 50);

    this.logger.debug({
      event: 'start', productId: input.productId, page, limit,
    });

    try {
      const product = await this.productsRepo.findByIdCore(input.productId);
      if (!product) {
        return left(new ProductNotFoundError(input.productId));
      }

      const [total, items] = await Promise.all([
        this.reviewsRepo.countByProduct(input.productId),
        this.reviewsRepo.listByProduct(input.productId, page, limit),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const out: Output = {
        reviews: items,
        pagination: {
          page, limit, total, totalPages,
        },
      };

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        productId: input.productId,
        count: items.length,
        total,
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
