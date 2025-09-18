import { Module } from '@nestjs/common';
import { CreateProductController } from './controllers/create-product.controller';
import { CreateProductUseCase } from '../core/use-cases/create-product.use-case';
import { RepositoriesModule } from '@/domain/repositories/repositories.module';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';

@Module({
  imports: [RepositoriesModule, AttachmentsModule],
  controllers: [
    CreateProductController,
  ],
  providers: [
    CreateProductUseCase,
  ],
})
export class HttpProductsModule {}
