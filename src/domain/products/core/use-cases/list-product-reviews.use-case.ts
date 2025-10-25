import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

type Input = {
  productId: string;
  page?: number;
  limit?: number
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null
  };
  images: Array<{ attachmentId: string }>;
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
    const requestedLimit = Number(input.limit ?? 10);
    const limit = Math.min(50, Math.max(1, Number.isNaN(requestedLimit) ? 10 : requestedLimit));

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
        this.reviewsRepo.listByProductWithUsers(input.productId, page, limit),
      ]);

      const reviews: ReviewItem[] = items.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          avatar: r.user.avatar,
        },
        images: (r.images ?? []).map((img) => ({ attachmentId: img.id })),
      }));

      const totalPages = Math.max(1, Math.ceil(total / limit));
      const out: Output = {
        reviews,
        pagination: {
          page, limit, total, totalPages,
        },
      };

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        productId: input.productId,
        count: reviews.length,
        total,
      });
      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        productId: input.productId,
        message: error.message,
        stack: error.stack,
        durationMs: Date.now() - startedAt,
      });
      return left(error);
    }
  }
}
