import { Injectable, Logger } from '@nestjs/common';
import { ProductCategoriesRepository } from '@/domain/repositories/product-categories.repository';

@Injectable()
export class ListProductCategoriesUseCase {
  private readonly logger = new Logger(ListProductCategoriesUseCase.name);

  constructor(private readonly repo: ProductCategoriesRepository) {}

  async execute() {
    const rows = await this.repo.findAll();

    return rows.map((c) => ({
      id: Number(c.id),
      nameFilter: c.nameFilter,
      nameExhibit: c.nameExhibit,
      description: c.description ?? null,
      imageUrl: c.imagePath ?? null,
    }));
  }
}
