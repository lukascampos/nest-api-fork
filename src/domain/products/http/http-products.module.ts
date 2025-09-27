import { Module } from '@nestjs/common';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from '../core/use-cases/create-product.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';
import { ListProductsUseCase } from '../core/use-cases/list-products.use-case';
import { ListProductsController } from './controllers/list-products.controller';
import { GetProductByIdController } from './controllers/get-product-by-id.controller';
import { GetProductByIdUseCase } from '../core/use-cases/get-product-by-id.use-case';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    CreateProductController,
    GetProductByIdController,
    ListProductsController,
  ],
  providers: [
    CreateProductUseCase,
    GetProductByIdUseCase,
    ListProductsUseCase,
  ],
})
export class HttpProductsModule {}
