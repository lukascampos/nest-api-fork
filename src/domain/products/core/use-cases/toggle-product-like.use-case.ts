import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ProductLikesRepository } from '@/domain/repositories/product-likes.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ProductNotFoundError } from '../errors/product-not-found.error';

export interface ToggleProductLikeInput {
  userId: string;
  productId: string;
}

export interface ToggleProductLikeOutput {
  action : 'liked' | 'unliked',
  likesCount: number;
}

type Output = Either<Error, ToggleProductLikeOutput>;

@Injectable()
export class ToggleProductLikeUseCase {
  private readonly logger = new Logger(ToggleProductLikeUseCase.name);

  constructor(
        private readonly productLikesRepository: ProductLikesRepository,
        private readonly productsRepository: ProductsRepository,
        private readonly prisma: PrismaService,
  ) {
    this.logger.log('ToggleProductLikeUseCase initialized');
  }

  async execute({ userId, productId }: ToggleProductLikeInput): Promise<Output> {
    try {
      const product = await this.productsRepository.findById(productId);
      if (!product || !product.isActive) {
        return left(new ProductNotFoundError(productId));
      }

      const existingLike = await this.productLikesRepository.findByProductAndUser(
        product.id,
        userId,
      );

      const result = await this.prisma.$transaction(async (tx) => {
        if (existingLike) {
          await this.productLikesRepository.delete(product.id, userId, tx);

          const updatedProduct = await tx.product.update({
            where: { id: product.id },
            data: { likesCount: { decrement: 1 } },
            select: { likesCount: true },
          });

          return { action: 'unliked', likesCount: updatedProduct.likesCount } as ToggleProductLikeOutput;
        }

        await this.productLikesRepository.create({ productId: product.id, userId }, tx);

        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: { likesCount: { increment: 1 } },
          select: { likesCount: true },
        });

        return { action: 'liked', likesCount: updatedProduct.likesCount } as ToggleProductLikeOutput;
      });

      this.logger.log(
        `Product ${productId} ${result.action} by user ${userId}. Total likes: ${result.likesCount}`,
      );

      return right(result);
    } catch (error) {
      this.logger.error('Error toggling product like:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
      });

      if (error.code === 'P2002') {
        return left(new Error('Duplicate like detected.'));
      }

      if (error.code === 'P2003') {
        return left(new Error('Invalid foreign key.'));
      }

      return left(new Error('Internal server error'));
    }
  }
}
