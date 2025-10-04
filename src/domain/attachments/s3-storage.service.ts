import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@/shared/env/env.service';

export interface UploadParams {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export interface UploadResult {
  success: boolean;
  id?: string;
  error?: string;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);

  constructor(
      private readonly client: S3Client,
      private readonly env: EnvService,
  ) {
    this.client = new S3Client({
      endpoint: this.env.get('STORAGE_URL'),
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.env.get('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: this.env.get('STORAGE_SECRET_ACCESS_KEY'),
      },
    });
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<UploadResult> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.env.get('STORAGE_BUCKET_NAME'),
          Key: fileName,
          ContentType: fileType,
          Body: body,
        }),
      );

      this.logger.log(`File uploaded to S3: ${fileName}`);

      return {
        id: fileName,
        success: true,
      };
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getUrlByFileName(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.env.get('STORAGE_BUCKET_NAME'),
      Key: fileName,
    });

    return getSignedUrl(
      this.client,
      command,
      { expiresIn: 60 * 60 * 24 }, // 24 hour expiration
    );
  }
}
