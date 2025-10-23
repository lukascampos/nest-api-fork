export class ReviewNotFoundError extends Error {
  constructor() {
    super('Avaliação não encontrada para este usuário/produto');
    this.name = 'ReviewNotFoundError';
  }
}
