import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Attachment } from '../../../core/entities/attachment.entity';
import { PrismaAttachmentsMapper } from '../mappers/prisma-attachments.mapper';

@Injectable()
export class PrismaAttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(attachment: Attachment): Promise<void> {
    const commonData = {
      id: attachment.id,
      filePath: attachment.url,
      fileName: attachment.fileName,
      fileType: attachment.mimeType,
      fileSize: attachment.sizeInBytes,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    };

    await this.prisma.attachment.upsert({
      where: { id: attachment.id },
      create: commonData,
      update: commonData,
    });
  }

  async findById(id: string): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id,
      },
    });

    if (!attachment) {
      return null;
    }

    return PrismaAttachmentsMapper.toDomain(attachment);
  }
}
