export class SamePasswordError extends Error {
  constructor() {
    super('A nova senha não pode ser igual à senha atual.');
    this.name = 'SamePasswordError';
  }
}
