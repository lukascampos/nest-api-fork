import { Injectable, Logger } from '@nestjs/common';
import { Attachment } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';
import { ArtisanApplicationsRepository } from '@/domain/repositories/artisan-applications.repository';
import { AttachmentsRepository } from '@/domain/repositories/attachments.repository';
import { ApplicationNotFoundError } from '../errors/application-not-found.error';

export interface GetArtisanApplicationDetailsInput {
  applicationId: string;
  userId?: string; // Para validação de segurança
}

export interface PhotoDetails {
  id: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  url: string;
}

export interface GetArtisanApplicationDetailsOutput {
  id: string;
  userId: string;
  formStatus: string;
  status: string;
  comercialName: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  rawMaterial: string[];
  technique: string[];
  finalityClassification: string[];
  sicab: string | null;
  sicabRegistrationDate: Date | null;
  sicabValidUntil: Date | null;
  bio: string | null;
  photos: string[];
}

type Output = Either<ApplicationNotFoundError, GetArtisanApplicationDetailsOutput>;

@Injectable()
export class GetArtisanApplicationDetailsUseCase {
  private readonly logger = new Logger(GetArtisanApplicationDetailsUseCase.name);

  constructor(
    private readonly artisanApplicationsRepository: ArtisanApplicationsRepository,
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute(input: GetArtisanApplicationDetailsInput): Promise<Output> {
    const { applicationId } = input;

    try {
      const application = await this.artisanApplicationsRepository.findById(applicationId);

      if (!application) {
        this.logger.warn(`Application not found: ${applicationId}`);
        return left(new ApplicationNotFoundError());
      }

      const attachments = await this
        .attachmentsRepository
        .findByArtisanApplicationId(applicationId);

      const photosWithUrls = await this.generatePhotoUrls(attachments);

      this.logger.debug(`Retrieved application details: ${applicationId} with ${photosWithUrls.photos.length} photos`);

      return right({
        id: application.id,
        userId: application.userId,
        formStatus: application.formStatus,
        status: application.status,
        comercialName: application.comercialName ?? '',
        zipCode: application.zipCode ?? '',
        address: application.address ?? '',
        addressNumber: application.addressNumber ?? '',
        addressComplement: application.addressComplement ?? undefined,
        neighborhood: application.neighborhood ?? '',
        city: application.city ?? '',
        state: application.state ?? '',
        rawMaterial: application.rawMaterial,
        technique: application.technique,
        finalityClassification: application.finalityClassification,
        sicab: application.sicab,
        sicabRegistrationDate: application.sicabRegistrationDate,
        sicabValidUntil: application.sicabValidUntil,
        bio: application.bio,
        photos: photosWithUrls.photos,
      });
    } catch (error) {
      this.logger.error(`Error getting application details: ${applicationId}`, error);
      return left(new ApplicationNotFoundError());
    }
  }

  private async generatePhotoUrls(attachments: Attachment[]): Promise<{photos: string[]}> {
    if (!attachments.length) {
      return {
        photos: [],
      };
    }

    try {
      const photosWithUrls = await Promise.all(
        attachments.map(async (attachment) => {
          try {
            const url = await this.s3StorageService.getUrlByFileName(attachment.id);

            return {
              url,
            };
          } catch (urlError) {
            this.logger.warn(`Failed to generate URL for attachment ${attachment.id}:`, urlError);
            return undefined;
          }
        }),
      );

      return {
        photos: photosWithUrls.filter((photo) => photo !== undefined).map((photo) => photo.url),
      };
    } catch (error) {
      this.logger.error('Error generating photo URLs:', error);
      return { photos: [] };
    }
  }
}
