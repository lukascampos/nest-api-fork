import { Injectable, Logger } from '@nestjs/common';
import { TechniquesRepository } from '@/domain/repositories/techniques.repository';

@Injectable()
export class ListTechniquesUseCase {
  private readonly logger = new Logger(ListTechniquesUseCase.name);

  constructor(private readonly repo: TechniquesRepository) {}

  async execute() {
    const rows = await this.repo.findAll();

    return rows.map((t) => ({
      id: Number(t.id),
      nameFilter: t.nameFilter,
      nameExhibit: t.nameExhibit,
      description: t.description ?? null,
    }));
  }
}
