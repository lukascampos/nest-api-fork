export class UnauthorizedApplicationAccessError extends Error {
  constructor() {
    super('Acesso não autorizado a esta solicitação');
    this.name = 'UnauthorizedApplicationAccessError';
  }
}
