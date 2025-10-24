import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ProductCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { nameExhibit: 'asc' },
    });
  }
}
