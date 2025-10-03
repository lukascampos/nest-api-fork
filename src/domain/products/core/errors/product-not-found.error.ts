export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Produto com id ${id} não encontrado`);
    this.name = 'ProductNotFoundError';
  }
}
