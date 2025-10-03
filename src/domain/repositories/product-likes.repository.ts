import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ProductLikesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; productId: string}) {
    return this.prisma.productLike.create({
      data,
    });
  }

  async delete(productId: string, userId: string) {
    return this.prisma.productLike.delete({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }

  async findByProductAndUser(productId: string, userId: string) {
    return this.prisma.productLike.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }

  async findManyByProductId(productId: string, page: number, limit: number) {
    return this.prisma.productLike.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async countByProductId(productId: string) {
    return this.prisma.productLike.count({
      where: { productId },
    });
  }
}
