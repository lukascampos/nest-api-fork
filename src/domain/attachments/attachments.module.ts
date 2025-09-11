import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { EnvModule } from '@/shared/env/env.module';
import { UploadAttachmentUseCase } from './upload-attachment.use-case';
import { S3StorageService } from './s3-storage.service';
import { UploadAttachmentController } from './upload-attachment.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [EnvModule, RepositoriesModule],
  providers: [UploadAttachmentUseCase, S3StorageService, S3Client],
  controllers: [UploadAttachmentController],
  exports: [S3StorageService],
})
export class AttachmentsModule {}
