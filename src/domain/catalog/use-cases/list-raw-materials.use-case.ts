import { Injectable, Logger } from '@nestjs/common';
import { RawMaterialsRepository } from '@/domain/repositories/raw-materials.repository';

@Injectable()
export class ListRawMaterialsUseCase {
  private readonly logger = new Logger(ListRawMaterialsUseCase.name);

  constructor(private readonly repo: RawMaterialsRepository) {}

  async execute() {
    const rows = await this.repo.findAll();

    return rows.map((r) => ({
      id: Number(r.id),
      nameFilter: r.nameFilter,
      nameExhibit: r.nameExhibit,
      description: r.description ?? null,
    }));
  }
}
