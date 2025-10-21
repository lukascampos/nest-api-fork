export class TargetNotArtisanError extends Error {
  constructor() {
    super('The target user is not an artisan.');
    this.name = 'TargetNotArtisanError';
  }
}
