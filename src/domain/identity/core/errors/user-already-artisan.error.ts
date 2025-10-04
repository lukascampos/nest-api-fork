export class UserAlreadyArtisanError extends Error {
  constructor() {
    super('Usuário já possui perfil de artesão');
    this.name = 'UserAlreadyArtisanError';
  }
}
