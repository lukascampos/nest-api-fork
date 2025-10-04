export class ApplicationAlreadyModeratedError extends Error {
  constructor() {
    super('Solicitação já foi moderada');
    this.name = 'ApplicationAlreadyModeratedError';
  }
}
