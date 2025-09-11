export class UploadFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadFailedError';
  }
}
