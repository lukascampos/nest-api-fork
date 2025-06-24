export class ArtisanProfileNotFoundError extends Error {
  constructor(userId: string) {
    super(`Perfil de artesão não encontrado para o usuário ${userId}`);
  }
}
