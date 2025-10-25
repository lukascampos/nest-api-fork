import { Injectable, Logger } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { FileSizeExceededError } from './errors/file-size-exceeded.error';
import { UploadFailedError } from './errors/upload-failed.error';
import { Either, left, right } from '../_shared/utils/either';
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type.error';
import { AttachmentsRepository } from '../repositories/attachments.repository';

export interface UploadAttachmentUseCaseInput {
  fileType: string;
  fileSize: number;
  body: Buffer;
}

export interface UploadAttachmentUseCaseOutput {
  id: string;
}

type Output = Either<
  InvalidAttachmentTypeError | FileSizeExceededError | UploadFailedError,
  UploadAttachmentUseCaseOutput
>;

@Injectable()
export class UploadAttachmentUseCase {
  private readonly logger = new Logger(UploadAttachmentUseCase.name);

  private readonly ALLOWED_TYPES = /^image\/(png|jpe?g|gif|webp)$/;

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3Storage: S3StorageService,
  ) {}

  async execute(input: UploadAttachmentUseCaseInput): Promise<Output> {
    const {
      fileType, body, fileSize,
    } = input;

    try {
      if (!this.ALLOWED_TYPES.test(fileType)) {
        this.logger.warn(`Invalid file type attempted: ${fileType}`);
        return left(new InvalidAttachmentTypeError(fileType));
      }

      if (fileSize > this.MAX_FILE_SIZE) {
        this.logger.warn(`File size exceeded: ${fileSize} bytes`);
        return left(new FileSizeExceededError(fileSize, this.MAX_FILE_SIZE));
      }

      const attachment = await this.attachmentsRepository.create({
        fileType,
        fileSize: BigInt(fileSize),
      });

      const uploadResult = await this.s3Storage.upload({
        fileName: attachment.id,
        fileType,
        body,
      });

      if (!uploadResult.success) {
        await this.attachmentsRepository.delete(attachment.id);
        return left(new UploadFailedError('Falha no upload para S3'));
      }

      this.logger.log(`File uploaded successfully: ${attachment.id}`);

      return right({
        id: attachment.id,
      });
    } catch (error) {
      this.logger.error('Error uploading attachment:', error);
      return left(new UploadFailedError('Erro interno no upload'));
    }
  }
}
