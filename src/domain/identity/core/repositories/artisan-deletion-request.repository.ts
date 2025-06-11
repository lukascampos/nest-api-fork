import { ArtisanDeletionRequest } from '../entities/artisan-deletion-request.entity';

export interface ArtisanDeletionRequestRepository {
  create(request: ArtisanDeletionRequest): Promise<ArtisanDeletionRequest>;
  findByUserId(userId: string): Promise<ArtisanDeletionRequest | null>;
  findById(id: string): Promise<ArtisanDeletionRequest | null>;
  save(request: ArtisanDeletionRequest): Promise<ArtisanDeletionRequest>;
}
