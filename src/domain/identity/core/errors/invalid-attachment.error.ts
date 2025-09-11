export class InvalidAttachmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAttachmentError';
  }
}
