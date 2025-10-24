export class InvalidPasswordError extends Error {
  constructor() {
    super('A senha atual fornecida é inválida.');
    this.name = 'InvalidPasswordError';
  }
}
