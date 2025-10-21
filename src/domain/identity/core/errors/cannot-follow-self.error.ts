export class CannotFollowSelfError extends Error {
  constructor() {
    super('User cannot follow yourself.');
    this.name = 'CannotFollowSelfError';
  }
}
