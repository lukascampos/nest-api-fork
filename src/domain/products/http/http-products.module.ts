import { Module } from '@nestjs/common';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from '../core/use-cases/create-product.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { ListProductsUseCase } from '../core/use-cases/list-products.use-case';
import { ListProductsController } from './controllers/list-products.controller';
import { GetProductByIdController } from './controllers/get-product-by-id.controller';
import { GetProductByIdUseCase } from '../core/use-cases/get-product-by-id.use-case';
import { UpdateProductController } from './controllers/update-product.controller';
import { UpdateProductUseCase } from '../core/use-cases/update-product.use-case';
import { GetProductLikeStatusController } from './controllers/get-product-like-status.controller';
import { ListProductLikesController } from './controllers/list-product-likes.controller';
import { ToggleProductLikeController } from './controllers/toggle-product-like.controller';
import { GetProductLikeStatusUseCase } from '../core/use-cases/get-product-like-status.use-case';
import { ListProductLikesUseCase } from '../core/use-cases/list-product-likes.use-case';
import { ToggleProductLikeUseCase } from '../core/use-cases/toggle-product-like.use-case';
import { GetFavoritesByUserIdController } from './controllers/get-favorites-by-user-id.controller';
import { GetFavoritesByUserIdUseCase } from '../core/use-cases/get-favorites-by-user-id.use-case';
import { GetHomeFeedController } from './controllers/get-home-feed.controller';
import { GetHomeFeedUseCase } from '../core/use-cases/get-home-feed.use-case';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    CreateProductController,
    GetFavoritesByUserIdController,
    GetHomeFeedController,
    GetProductByIdController,
    ListProductsController,
    UpdateProductController,
    ToggleProductLikeController,
    GetProductLikeStatusController,
    ListProductLikesController,
  ],
  providers: [
    CreateProductUseCase,
    GetFavoritesByUserIdUseCase,
    GetHomeFeedUseCase,
    GetProductByIdUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    ToggleProductLikeUseCase,
    GetProductLikeStatusUseCase,
    ListProductLikesUseCase,
  ],
})
export class HttpProductsModule {}
