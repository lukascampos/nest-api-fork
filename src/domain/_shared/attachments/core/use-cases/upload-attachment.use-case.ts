import { Injectable } from '@nestjs/common';
import { PrismaAttachmentsRepository } from '../../persistence/prisma/repositories/prisma-attachments.repository';
import { Attachment } from '../entities/attachment.entity';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { R2AttachmentsStorage } from '../../persistence/r2/r2-attachments.storage';
import { InvalidAttachmentTypeError } from '../errors/Invalid-attachment-type.error';

export interface UploadAttachmentUseCaseInput {
  fileType: string;
  fileSize: number;
  body: Buffer;
}

export interface UploadAttachmentUseCaseOutput {
  attachment: Attachment;
}

type Output = Either<Error, UploadAttachmentUseCaseOutput>;

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private readonly prismaAttachmentsRepository: PrismaAttachmentsRepository,
    private readonly r2Storage: R2AttachmentsStorage,
  ) {}

  async execute({
    fileType,
    body,
    fileSize,
  }: UploadAttachmentUseCaseInput): Promise<Output> {
    if (!/^image\/(png|jpe?g)$/.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileType));
    }

    const { url } = await this.r2Storage.upload({
      fileType,
      body,
    });

    const attachment = Attachment.create({
      url,
      fileName: url,
      mimeType: fileType,
      sizeInBytes: fileSize,
    });

    await this.prismaAttachmentsRepository.save(attachment);

    return right({
      attachment,
    });
  }
}
