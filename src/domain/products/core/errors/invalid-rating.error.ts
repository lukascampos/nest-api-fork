export class InvalidRatingError extends Error {
  constructor() {
    super('A nota deve estar entre 1 e 5');
    this.name = 'InvalidRatingError';
  }
}
