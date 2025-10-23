import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ProductReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating | null> {
    const db = (tx ?? this.prisma);
    return db.productRating.findUnique({
      where: { productId_userId: { productId, userId } },
    });
  }

  async create(
    userId: string,
    productId: string,
    rating: number,
    comment?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating> {
    const db = (tx ?? this.prisma);
    return db.productRating.create({
      data:
      {
        userId,
        productId,
        rating,
        comment: comment ?? null,
      },
    });
  }

  async update(
    id: string,
    rating: number,
    comment?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<import('@prisma/client').ProductRating> {
    const db = (tx ?? this.prisma);
    return db.productRating.update({
      where: { id },
      data: { rating, comment: comment ?? null },
    });
  }

  async deleteByUserAndProduct(
    userId: string,
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = (tx ?? this.prisma);
    const res = await db.productRating.deleteMany({ where: { userId, productId } });
    return res.count;
  }

  async listByProduct(
    productId: string,
    page: number,
    limit: number,
    tx?: Prisma.TransactionClient,
  ): Promise<
    Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: { id: string; name: string; avatar: string | null };
    }>
  > {
    const db = (tx ?? this.prisma);
    const skip = (page - 1) * limit;

    const rows = await db.productRating.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true, avatar: true } } }, // sem phone
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip,
      take: limit,
    });

    return rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      user: { id: r.user.id, name: r.user.name, avatar: r.user.avatar },
    }));
  }

  async countByProduct(
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = (tx ?? this.prisma);
    return db.productRating.count({ where: { productId } });
  }

  async aggregateByProduct(
    productId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{ avg: number | null; count: number }> {
    const db = (tx ?? this.prisma);
    const stats = await db.productRating.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { avg: stats._avg.rating ?? null, count: stats._count.rating };
  }
}
