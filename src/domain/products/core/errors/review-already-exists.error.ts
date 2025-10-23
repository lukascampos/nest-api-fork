export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super('Você já avaliou este produto');
    this.name = 'ReviewAlreadyExistsError';
  }
}
