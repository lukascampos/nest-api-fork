export class OperationNotAllowedError extends Error {
  constructor(message = 'Operação não permitida') {
    super(message);
    this.name = 'OperationNotAllowedError';
  }
}
