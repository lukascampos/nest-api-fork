import { Injectable, Logger } from '@nestjs/common';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { ApplicationAlreadySubmittedError } from '../errors/application-already-submitted.error';
import { ApplicationNotFoundError } from '../errors/application-not-found.error';
import { InvalidAttachmentError } from '../errors/invalid-attachment.error';
import { UnauthorizedApplicationAccessError } from '../errors/unauthorized-application-access.error';

export interface CompleteArtisanApplicationInput {
  userId: string;
  applicationId: string;
  data: {
    rawMaterial: string[];
    technique: string[];
    finalityClassification: string[];
    bio?: string;
    photosIds?: string[];
    sicab?: string;
    sicabRegistrationDate?: Date;
    sicabValidUntil?: Date;
  };
}

export interface CompleteArtisanApplicationOutput {
  applicationId: string;
  status: string;
  message: string;
  attachedPhotos: number;
}

type Output = Either<
  ApplicationNotFoundError |
  ApplicationAlreadySubmittedError |
  UnauthorizedApplicationAccessError |
  InvalidAttachmentError,
  CompleteArtisanApplicationOutput
>;

@Injectable()
export class CompleteArtisanApplicationUseCase {
  private readonly logger = new Logger(CompleteArtisanApplicationUseCase.name);

  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
  ) {}

  async execute(input: CompleteArtisanApplicationInput): Promise<Output> {
    const { userId, applicationId, data } = input;

    try {
      const application = await this.artisanApplicationsRepository.findById(applicationId);

      if (!application) {
        return left(new ApplicationNotFoundError());
      }

      if (application.userId !== userId) {
        return left(new UnauthorizedApplicationAccessError());
      }

      if (application.formStatus === 'SUBMITTED') {
        return left(new ApplicationAlreadySubmittedError());
      }

      let attachedPhotosCount = 0;

      if (data.photosIds && data.photosIds.length > 0) {
        const validationResult = await this.validateAndLinkAttachments(
          data.photosIds,
          userId,
          applicationId,
        );

        if (validationResult.isLeft()) {
          return left(validationResult.value);
        }

        attachedPhotosCount = data.photosIds.length;
      }

      const updatedApplication = await this.artisanApplicationsRepository.update(applicationId, {
        formStatus: 'SUBMITTED',
        rawMaterial: data.rawMaterial,
        technique: data.technique,
        finalityClassification: data.finalityClassification,
        bio: data.bio,
        sicab: data.sicab,
        sicabRegistrationDate: data.sicabRegistrationDate,
        sicabValidUntil: data.sicabValidUntil,
        updatedAt: new Date(),
      });

      this.logger.log(
        `Artisan application completed: ${applicationId} - User: ${userId} - Photos: ${attachedPhotosCount}`,
      );

      return right({
        applicationId: updatedApplication.id,
        status: 'SUBMITTED',
        message: 'Sua solicitação foi enviada e está sendo analisada',
        attachedPhotos: attachedPhotosCount,
      });
    } catch (error) {
      this.logger.error('Error completing artisan application:', error);
      throw error;
    }
  }

  private async validateAndLinkAttachments(
    attachmentIds: string[],
    userId: string,
    applicationId: string,
  ): Promise<Either<InvalidAttachmentError, void>> {
    try {
      const attachments = await Promise.all(
        attachmentIds.map((attachmentId) => this.attachmentsRepository.findById(attachmentId)),
      );

      for (let i = 0; i < attachments.length; i += 1) {
        const attachment = attachments[i];
        const attachmentId = attachmentIds[i];

        if (!attachment) {
          this.logger.warn(`Attachment not found: ${attachmentId}`);
          return left(new InvalidAttachmentError(`Imagem não encontrada: ${attachmentId}`));
        }

        if (attachment.artisanApplicationId && attachment.artisanApplicationId !== applicationId) {
          this.logger.warn(`Attachment already linked: ${attachmentId}`);
          return left(new InvalidAttachmentError('Uma das imagens já está vinculada a outra solicitação'));
        }
      }

      await this.attachmentsRepository.linkToArtisanApplication(attachmentIds, applicationId);

      this.logger.log(`Linked ${attachmentIds.length} attachments to application ${applicationId}`);

      return right(undefined);
    } catch (error) {
      this.logger.error('Error validating/linking attachments:', error);
      return left(new InvalidAttachmentError('Erro ao processar as imagens'));
    }
  }
}
