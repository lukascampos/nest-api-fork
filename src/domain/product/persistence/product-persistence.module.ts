import { Module } from "@nestjs/common";
import { PrismaProductsRepository } from "./prisma/repositories/prisma-products.repository";
import { PrismaProductPhotosRepository } from "./prisma/repositories/prisma-product-photos.repository";
import { PrismaService } from "@/shared/prisma/prisma.service";

@Module({
  providers: [
    PrismaService,
    PrismaProductsRepository,
    PrismaProductPhotosRepository,
  ],
  exports: [
    PrismaProductsRepository,
    PrismaProductPhotosRepository,
  ]
  })
export class ProductPersistenceModule {}