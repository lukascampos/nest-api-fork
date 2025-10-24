export class PendingApplicationAlreadyExistsError extends Error {
  constructor() {
    super('Já existe uma aplicação pendente para este usuário.');
    this.name = 'PendingApplicationAlreadyExistsError';
  }
}
