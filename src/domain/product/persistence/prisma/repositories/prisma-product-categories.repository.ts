import { PrismaService } from "@/shared/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaProductCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<boolean> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return false;
    }

    return true;
  }
}