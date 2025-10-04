export class UserNotFoundError extends Error {
  constructor(identifier: string, field: 'id' | 'email' | 'cpf') {
    super(`Usuário não encontrado com este ${field}: ${identifier}`);
    this.name = 'UserNotFoundError';
  }
}
