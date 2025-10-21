export class CannotFollowSelfError extends Error {
  constructor() {
    super('User cannot follow themselves.');
    this.name = 'CannotFollowSelfError';
  }
}
