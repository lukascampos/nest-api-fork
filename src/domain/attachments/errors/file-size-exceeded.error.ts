export class FileSizeExceededError extends Error {
  constructor(actualSize: number, maxSize: number) {
    const actualMB = (actualSize / 1024 / 1024).toFixed(2);
    const maxMB = (maxSize / 1024 / 1024).toFixed(2);
    super(`Tamanho do arquivo excedido: ${actualMB}MB. Máximo permitido: ${maxMB}MB`);
    this.name = 'FileSizeExceededError';
  }
}
