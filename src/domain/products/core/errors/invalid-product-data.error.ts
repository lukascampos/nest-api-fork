export class InvalidProductDataError extends Error {
  constructor(message: string) {
    super(`Dados inválidos para o produto: ${message}`);
    this.name = 'InvalidProductDataError';
  }
}
