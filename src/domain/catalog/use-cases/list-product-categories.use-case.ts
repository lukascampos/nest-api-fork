import { Injectable, Logger } from '@nestjs/common';
import { ProductCategoriesRepository } from '@/domain/repositories/product-categories.repository';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

@Injectable()
export class ListProductCategoriesUseCase {
  private readonly logger = new Logger(ListProductCategoriesUseCase.name);

  constructor(
    private readonly repo: ProductCategoriesRepository,
    private readonly storage: S3StorageService,
  ) {}

  async execute() {
    const rows = await this.repo.findAll();

    const toKey = (imagePath?: string, nameFilter?: string) => {
      if (!imagePath) return `categories/${nameFilter?.toLowerCase()}.jpg`;
      try {
        const url = new URL(imagePath);
        const parts = url.pathname.replace(/^\/+/, '').split('/');
        const key = parts.length > 1 ? parts.slice(1).join('/') : parts[0];
        return key;
      } catch {
        return imagePath;
      }
    };

    const items = await Promise.all(
      rows.map(async (c) => {
        const key = toKey(c.imagePath ?? undefined, c.nameFilter);
        const signed = await this.storage.getUrlByFileName(key);
        return {
          id: Number(c.id),
          nameFilter: c.nameFilter,
          nameExhibit: c.nameExhibit,
          description: c.description ?? null,
          imageUrl: signed,
        };
      }),
    );
    return items;
  }
}
