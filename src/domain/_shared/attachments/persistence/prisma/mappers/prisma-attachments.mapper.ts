import { Attachment as PrismaAttachment, Prisma } from '@prisma/client';
import { Attachment } from '../../../core/entities/attachment.entity';

export class PrismaAttachmentsMapper {
  static toDomain(attachment: PrismaAttachment): Attachment | null {
    if (attachment.userId) {
      return Attachment.create({
        url: attachment.filePath,
        fileName: attachment.fileName,
        mimeType: attachment.fileType,
        sizeInBytes: Number(attachment.fileSize),
      }, attachment.id, attachment.createdAt, attachment.updatedAt);
    } if (attachment.artisanId) {
      return Attachment.create({
        url: attachment.filePath,
        fileName: attachment.fileName,
        mimeType: attachment.fileType,
        sizeInBytes: Number(attachment.fileSize),
      }, attachment.id, attachment.createdAt, attachment.updatedAt);
    }

    return null;
  }

  static toPrisma(attachment: Attachment): Prisma.AttachmentUncheckedCreateInput | null {
    return {
      id: attachment.id,
      filePath: attachment.url,
      fileName: attachment.fileName,
      fileType: attachment.mimeType,
      fileSize: attachment.sizeInBytes,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    };
  }
}
