export class ApplicationAlreadySubmittedError extends Error {
  constructor() {
    super('Solicitação já foi enviada');
    this.name = 'ApplicationAlreadySubmittedError';
  }
}
