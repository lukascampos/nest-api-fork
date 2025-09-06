import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductPhoto } from '@/domain/product/core/entities/product-photo.entity';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaProductPhotosMapper } from '../mappers/prisma-product-photos.mapper';

@Injectable()
export class PrismaProductPhotosRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(photos: ProductPhoto[]): Promise<void> {
    if (photos.length === 0) {
      return;
    }

    const data = PrismaProductPhotosMapper.toPrismaUpdateMany(photos);

    await this.prisma.attachment.updateMany(data);
  }

  async createManyWithTx(tx: Prisma.TransactionClient, photos: ProductPhoto[]): Promise<void> {
    if (photos.length === 0) return;

    const data = PrismaProductPhotosMapper.toPrismaUpdateMany(photos);
    await tx.attachment.updateMany(data);
  }

  async deleteMany(attachments: ProductPhoto[]): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    const attachmentIds = attachments.map((attachment) => attachment.id.toString());

    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: attachmentIds,
        },
      },
    });
  }

  async deleteManyWithTx(tx: Prisma.TransactionClient, attachments: ProductPhoto[]): Promise<void> {
    if (attachments.length === 0) return;

    const attachmentIds = attachments.map((attachment) => attachment.attachmentId);

    await tx.attachment.updateMany({
      where: { id: { in: attachmentIds } },
      data: { productId: null },
    });
  }

  async deleteManyByProductId(productId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        productId,
      },
    });
  }
}
