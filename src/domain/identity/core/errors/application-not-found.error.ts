export class ApplicationNotFoundError extends Error {
  constructor() {
    super('Solicitação não encontrada');
    this.name = 'ApplicationNotFoundError';
  }
}
