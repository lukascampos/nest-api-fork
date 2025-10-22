import { Module } from '@nestjs/common';
import { CatalogController } from './controllers/catalog.controller';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RawMaterialsRepository } from '@/domain/repositories/raw-materials.repository';
import { TechniquesRepository } from '@/domain/repositories/techniques.repository';
import { ProductCategoriesRepository } from '@/domain/repositories/product-categories.repository';
import { ListRawMaterialsUseCase } from '@/domain/catalog/use-cases/list-raw-materials.use-case';
import { ListTechniquesUseCase } from '@/domain/catalog/use-cases/list-techniques.use-case';
import { ListProductCategoriesUseCase } from '@/domain/catalog/use-cases/list-product-categories.use-case';
import { AttachmentsModule } from '@/domain/attachments/attachments.module';

@Module({
  imports: [AttachmentsModule],
  controllers: [CatalogController],
  providers: [
    PrismaService,
    RawMaterialsRepository,
    TechniquesRepository,
    ProductCategoriesRepository,
    ListRawMaterialsUseCase,
    ListTechniquesUseCase,
    ListProductCategoriesUseCase,
  ],
  exports: [],
})
export class CatalogHttpModule {}
