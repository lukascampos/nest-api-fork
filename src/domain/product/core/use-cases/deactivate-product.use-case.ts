import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaProductsRepository } from '../../persistence/prisma/repositories/prisma-products.repository';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { NotAllowedError } from '../errors/not-allowed.error';
import { ProductAlreadyInactiveError } from '../errors/product-already-inactive.error';

export interface DeactivateProductInput {
    productId: string;
    requesterId: string;
    requesterRole: string[];
}

type Output = Either<
    ProductNotFoundError | NotAllowedError | ProductAlreadyInactiveError,
    { message: string}
>;

@Injectable()
export class DeactivateProductUseCase {
  constructor(private readonly productsRepository: PrismaProductsRepository) {}

  async execute({
    productId, requesterId, requesterRole,
  }: DeactivateProductInput): Promise<Output> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      return left(new ProductNotFoundError(productId));
    }

    const isOwner = product.artisanId === requesterId;
    const isAdmin = requesterRole.includes('ADMIN');
    const canManage = isOwner || isAdmin;

    if (!canManage) {
      return left(new NotAllowedError());
    }

    const alreadyInactive = await this.productsRepository.isDisabled(productId);

    if (alreadyInactive) {
      return left(new ProductAlreadyInactiveError(productId));
    }

    await this.productsRepository.deactivate(productId);
    return right({ message: 'Product deactivated successfully' });
  }
}
