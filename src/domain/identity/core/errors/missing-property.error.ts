export class MissingPropertyError extends Error {
  constructor(property: 'rejectionReason') {
    super(`Propriedade obrigatória ausente: ${property}`);
    this.name = 'MissingPropertyError';
  }
}
