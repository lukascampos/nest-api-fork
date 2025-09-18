import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findRawMaterialsByIds(ids: number[]) {
    return this.prisma.rawMaterial.findMany({
      where: { id: { in: ids } },
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findTechniquesByIds(ids: number[]) {
    return this.prisma.technique.findMany({
      where: { id: { in: ids } },
      orderBy: { nameFilter: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }
}
