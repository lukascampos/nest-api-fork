import { RequestStatus } from '@prisma/client';

export class ArtisanDeletionRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: RequestStatus,
    public readonly createdAt: Date,
    public reviewedAt?: Date,
    public reviewerId?: string,
    public rejectionReason?: string,
  ) {}
}
