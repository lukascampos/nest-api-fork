import { Module } from "@nestjs/common";
import { CreateProductController } from "./controllers/create-product.controller";
import { ProductPersistenceModule } from "../persistence/product-persistence.module";
import { CreateProductUseCase } from "../core/use-cases/create-product.use-case";

@Module({
  imports: [ProductPersistenceModule],
  controllers: [
    CreateProductController,
  ],
  providers: [
    CreateProductUseCase
  ],
})
export class HttpModule {}