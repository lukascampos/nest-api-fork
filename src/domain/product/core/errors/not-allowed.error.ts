export class NotAllowedError extends Error {
  constructor() {
    super('You cannot perform this action.');
  }
}
