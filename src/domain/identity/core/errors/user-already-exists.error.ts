export class UserAlreadyExistsError extends Error {
  constructor(identifier: string, field: 'email' | 'cpf' | 'phone') {
    super(`Usuário já existe com este ${field}: ${identifier}`);
    this.name = 'UserAlreadyExistsError';
  }
}
