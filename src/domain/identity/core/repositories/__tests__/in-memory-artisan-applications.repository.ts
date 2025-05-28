import { ArtisanApplication } from '../../entities/artisan-application.entity';
import { ArtisanApplicationsRepository } from '../artisan-applications.repository';

export class InMemoryArtisanApplicationsRepository implements ArtisanApplicationsRepository {
  private items: ArtisanApplication[] = [];

  async findByUserId(userId: string): Promise<ArtisanApplication[] | null> {
    const artisanApplications = this.items.filter((item) => item.userId === userId);
    return artisanApplications.length > 0 ? artisanApplications : null;
  }

  async findById(id: string): Promise<ArtisanApplication | null> {
    const artisanApplication = this.items.find((item) => item.id === id);
    return artisanApplication || null;
  }

  async listAll(): Promise<ArtisanApplication[]> {
    return this.items;
  }

  async save(artisanApplication: ArtisanApplication): Promise<void> {
    const application = this.items.findIndex((item) => item.id === artisanApplication.id);

    if (application >= 0) {
      this.items[application] = artisanApplication;
    } else {
      this.items.push(artisanApplication);
    }
  }
}
