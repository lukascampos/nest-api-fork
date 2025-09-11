export class ProductAlreadyInactiveError extends Error {
  constructor(id: string) {
    super(`Product with ID "${id}" is already inactive.`);
  }
}
