import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class TechniquesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.technique.findMany({
      where: { isActive: true },
      orderBy: { nameExhibit: 'asc' },
    });
  }
}
