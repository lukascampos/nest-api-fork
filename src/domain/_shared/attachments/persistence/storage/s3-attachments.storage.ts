import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/shared/env/env';

export interface UploadParams {
  fileType: string;
  body: Buffer;
}

@Injectable()
export class S3AttachmentsStorage {
  private client: S3Client;

  constructor(
      private readonly s3Client: S3Client,
      private readonly config: ConfigService<Env, true>,
  ) {

    this.client = new S3Client({
      endpoint: this.config.get('STORAGE_URL', { infer: true }),
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get('STORAGE_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: this.config.get('STORAGE_SECRET_ACCESS_KEY', { infer: true }),
      },
    });
  }

  async upload({
    fileType,
    body,
  }: UploadParams): Promise<{ url: string }> {
    const newFileName = randomUUID();

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get('STORAGE_BUCKET_NAME', { infer: true }),
        Key: newFileName,
        ContentType: fileType,
        Body: body,
      }),
    );

    return {
      url: newFileName,
    };
  }
}
