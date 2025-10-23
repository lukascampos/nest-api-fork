import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ceil1 } from '@/domain/_shared/utils/number.utils';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { OperationNotAllowedError } from '../errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';

type Input = { currentUserId: string; productId: string };
type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class DeleteProductReviewUseCase {
  private readonly logger = new Logger(DeleteProductReviewUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const startedAt = Date.now();
    this.logger.debug({ event: 'start', ...input });

    try {
      const { currentUserId, productId } = input;

      const product = await this.productsRepo.findByIdCore(productId);
      if (!product) return left(new ProductNotFoundError(productId));
      if (!product.isActive) return left(new OperationNotAllowedError('Inactive product'));

      const isDisabled = await this.usersRepo.findIsDisabledById(currentUserId);
      if (isDisabled === null) return left(new OperationNotAllowedError('Invalid user'));
      if (isDisabled) return left(new OperationNotAllowedError('User is disabled'));

      const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await this.reviewsRepo.deleteByUserAndProduct(currentUserId, productId, tx);

        const { avg, count } = await this.reviewsRepo.aggregateByProduct(productId, tx);
        await this.productsRepo.updateAverageRating({ productId, averageRating: avg ?? null }, tx);

        return { averageRating: ceil1(avg ?? 0), totalReviews: count };
      });

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - startedAt,
        productId,
        currentUserId,
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
      });

      return right(result);
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
