import { Injectable, Inject } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import { ArtisanApplicationsRepository } from '../repositories/artisan-applications.repository';
import { ArtisanApplication } from '../entities/artisan-application.entity';

@Injectable()
export class ReviewDisableArtisanUseCase {
  constructor(
    @Inject('ArtisanApplicationsRepository')
    private readonly repo: ArtisanApplicationsRepository,
  ) {}

  async execute(input: {
    id: string;
    reviewerId: string;
    status: RequestStatus;
    rejectionReason?: string;
  }): Promise<ArtisanApplication> {
    const application = await this.repo.findById(input.id);
    if (!application) {
      throw new Error('Solicitação não encontrada');
    }
    if (application.status !== RequestStatus.PENDING) {
      throw new Error('Esta solicitação já foi analisada');
    }
    if (input.status === RequestStatus.REJECTED && !input.rejectionReason) {
      throw new Error('É necessário fornecer um motivo para reprovação');
    }
    if (input.status === RequestStatus.APPROVED) {
      application.approve(input.reviewerId);
    } else {
      // para REJECTED certifique-se que rejectionReason não é undefined
      application.reject(input.rejectionReason!, input.reviewerId);
    }
    await this.repo.save(application);
    return application;
  }
}
