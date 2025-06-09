import { Entity } from '../../core/entities/entity';

export interface AttachmentProps {
  url: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
}

export class Attachment extends Entity<AttachmentProps> {
  private constructor(props: AttachmentProps, id?: string, createdAt?: Date, updatedAt?: Date) {
    super(props, id, createdAt, updatedAt);
  }

  static create(
    props: AttachmentProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Attachment {
    return new Attachment(props, id, createdAt, updatedAt);
  }

  get url(): string {
    return this.props.url;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get sizeInBytes(): number {
    return this.props.sizeInBytes;
  }
}
