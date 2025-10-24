import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class RawMaterialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { nameExhibit: 'asc' },
    });
  }
}
