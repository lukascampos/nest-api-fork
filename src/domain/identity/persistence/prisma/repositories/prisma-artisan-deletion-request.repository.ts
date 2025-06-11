import { RequestStatus } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ArtisanDeletionRequestRepository } from '../../../../core/repositories/artisan-deletion-request.repository';
import { ArtisanDeletionRequest } from '../../../../core/entities/artisan-deletion-request.entity';

export class PrismaArtisanDeletionRequestRepository implements ArtisanDeletionRequestRepository {
  constructor(private prisma: PrismaService) {}

  async create(request: ArtisanDeletionRequest): Promise<ArtisanDeletionRequest> {
    const created = await this.prisma.artisanDeletionRequest.create({
      data: {
        id: request.id,
        userId: request.userId,
        status: request.status,
        createdAt: request.createdAt,
      },
    });
    return this.toDomain(created);
  }

  async findByUserId(userId: string): Promise<ArtisanDeletionRequest | null> {
    const found = await this.prisma.artisanDeletionRequest.findFirst({ where: { userId } });
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<ArtisanDeletionRequest | null> {
    const found = await this.prisma.artisanDeletionRequest.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async save(request: ArtisanDeletionRequest): Promise<ArtisanDeletionRequest> {
    const updated = await this.prisma.artisanDeletionRequest.update({
      where: { id: request.id },
      data: {
        status: request.status,
        reviewerId: request.reviewerId,
        rejectionReason: request.rejectionReason,
        updatedAt: new Date(),
      },
    });
    if (request.status === RequestStatus.APPROVED) {
      await this.prisma.artisanProfile.update({
        where: { userId: request.userId },
        data: { isDisabled: true },
      });
    }
    return this.toDomain(updated);
  }

  private toDomain(data: any): ArtisanDeletionRequest {
    return new ArtisanDeletionRequest(
      data.id,
      data.userId,
      data.status,
      data.createdAt,
      data.updatedAt,
      data.reviewerId,
      data.rejectionReason,
    );
  }
}
