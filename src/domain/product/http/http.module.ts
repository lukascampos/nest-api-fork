import { Module } from '@nestjs/common';
import { CreateProductController } from './controllers/create-product.controller';
import { ProductPersistenceModule } from '../persistence/product-persistence.module';
import { CreateProductUseCase } from '../core/use-cases/create-product.use-case';
import { GetProductByIdUseCase } from '../core/use-cases/get-product-by-id.use-case';
import { AttachmentPersistenceModule } from '@/domain/_shared/attachments/persistence/attachment-persistence.module';
import { GetProductByIdController } from './controllers/get-product-by-id.controller';
import { IdentityPersistenceModule } from '@/domain/identity/persistence/identity-persistence.module';
import { ListProductsController } from './controllers/list-products.controller';
import { ListProductsUseCase } from '../core/use-cases/list-products.use-case';
import { UpdateProductController } from './controllers/update-product.controller';
import { UpdateProductUseCase } from '../core/use-cases/update-product.use-case';

@Module({
  imports: [ProductPersistenceModule, AttachmentPersistenceModule, IdentityPersistenceModule],
  controllers: [
    CreateProductController,
    GetProductByIdController,
    ListProductsController,
    UpdateProductController,
  ],
  providers: [
    CreateProductUseCase,
    GetProductByIdUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
  ],
})
export class HttpModule {}
