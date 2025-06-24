export class PendingDisableRequestAlreadyExistsError extends Error {
  constructor(userId: string) {
    super(`Já existe uma solicitação de desativação pendente para o usuário ${userId}`);
  }
}
