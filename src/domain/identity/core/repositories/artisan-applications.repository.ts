import { ArtisanApplication } from '../entities/artisan-application.entity';

export abstract class ArtisanApplicationsRepository {
  abstract findByUserId(userId: string): Promise<ArtisanApplication[] | null>;

  abstract listAll(): Promise<ArtisanApplication[]>;

  abstract save(artisanApplication: ArtisanApplication): Promise<void>;
}
