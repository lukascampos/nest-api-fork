export class NotAllowedError extends Error {
  constructor() {
    super('Você não tem permissão para realizar esta ação.');
    this.name = 'NotAllowedError';
  }
}
