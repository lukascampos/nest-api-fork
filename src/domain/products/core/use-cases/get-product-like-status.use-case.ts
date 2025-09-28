import { Injectable, Logger } from '@nestjs/common';
import {
  Either, left, right,
} from '@/domain/_shared/utils/either';
import { ProductLikesRepository } from '@/domain/repositories/product-likes.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

export interface GetProductLikeStatusInput {
    userId: string;
    productId: string;
}

export interface GetProductLikeStatusOutput {
    isLiked: boolean;
    likesCount: number;
    likedAt?: Date;
}

type Output = Either<Error, GetProductLikeStatusOutput>;

@Injectable()
export class GetProductLikeStatusUseCase {
  private readonly logger = new Logger(GetProductLikeStatusUseCase.name);

  constructor(
        private readonly productLikesRepository: ProductLikesRepository,
        private readonly productsRepository: ProductsRepository,
  ) {}

  async execute({ userId, productId }: GetProductLikeStatusInput): Promise<Output> {
    try {
      const productExists = await this.productsRepository.findBySlug(productId.toString());
      if (!productExists || !productExists.isActive) {
        return left(new ProductNotFoundError(productId));
      }

      const like = await this.productLikesRepository.findByProductAndUser(productId, userId);

      return right({
        isLiked: !!like,
        likesCount: productExists.likesCount,
        likedAt: like?.createdAt,
      });
    } catch (error) {
      this.logger.error('Failed to get product like status', {
        error: error.message,
        stack: error.stack,
      });
      return left(new Error('Failed to get product like status'));
    }
  }
}
