export class RequestFailedError extends Error {
  constructor() {
    super('A requisição falhou. Por favor, tente novamente mais tarde.');
    this.name = 'RequestFailedError';
  }
}
