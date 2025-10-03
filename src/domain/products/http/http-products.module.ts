import { Module } from '@nestjs/common';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from '../core/use-cases/create-product.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { GetProductLikeStatusController } from './controllers/get-product-like-status.controller';
import { ListProductLikesController } from './controllers/list-product-likes.controller';
import { ToggleProductLikeController } from './controllers/toggle-product-like.controller';
import { ProductLikesRepository } from '@/domain/repositories/product-likes.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { GetProductLikeStatusUseCase } from '../core/use-cases/get-product-like-status.use-case';
import { ListProductLikesUseCase } from '../core/use-cases/list-product-likes.use-case';
import { ToggleProductLikeUseCase } from '../core/use-cases/toggle-product-like.use-case';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    CreateProductController,
    ToggleProductLikeController,
    GetProductLikeStatusController,
    ListProductLikesController,
  ],
  providers: [
    CreateProductUseCase,
    ToggleProductLikeUseCase,
    GetProductLikeStatusUseCase,
    ListProductLikesUseCase,
    ProductsRepository,
    ProductLikesRepository,
  ],
})
export class HttpProductsModule {}
