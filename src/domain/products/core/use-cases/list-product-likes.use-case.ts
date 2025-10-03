import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductLikesRepository } from '@/domain/repositories/product-likes.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';

export interface LikesProductsInput {
  productId: string;
  page: number;
  limit: number;
}

export interface LikesProductsOutput {
    likes: {
        id: string;
        user: {
            id: string;
            name: string;
            avatar: string | null;
        };
        createdAt: Date;
    }[];
    pagination:{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

type Output = Either<Error, LikesProductsOutput>;

@Injectable()
export class ListProductLikesUseCase {
  private readonly logger = new Logger(ListProductLikesUseCase.name);

  constructor(
    private readonly productLikesRepository: ProductLikesRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute({ productId, page, limit }: LikesProductsInput): Promise<Output> {
    try {
      const productExists = await this.productsRepository.findBySlug(productId.toString());
      if (!productExists || !productExists.isActive) {
        return left(new ProductNotFoundError(productId));
      }
      const likes = await this.productLikesRepository.findManyByProductId(
        productExists.id,
        page,
        limit,
      );
      const totalLikes = await this.productLikesRepository.countByProductId(productExists.id);
      const totalPages = Math.ceil(totalLikes / limit);

      return right({
        likes,
        pagination: {
          page,
          limit,
          total: totalLikes,
          totalPages,
        },
      });
    } catch (error) {
      this.logger.error('Failed to list product likes', {
        error: error.message,
        stack: error.stack,
      });
      return left(new Error('Failed to list product likes'));
    }
  }
}
