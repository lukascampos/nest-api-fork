export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(`Dados inválidos: ${message}`);
    this.name = 'InvalidUserDataError';
  }
}
