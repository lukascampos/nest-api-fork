export class NotAlloweError extends Error {
  constructor() {
    super('You cannot perform this action.');
  }
}
