import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments.repository';
import { R2AttachmentsStorage } from './r2/r2-attachments.storage';

@Module({
  providers: [
    PrismaService,
    PrismaAttachmentsRepository,
    R2AttachmentsStorage,
    S3Client,
  ],
  exports: [
    PrismaAttachmentsRepository,
    R2AttachmentsStorage,
  ],
})
export class AttachmentPersistenceModule {}
