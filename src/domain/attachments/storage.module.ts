import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { EnvService } from '@/shared/env/env.service';
import { S3StorageService } from '@/domain/attachments/s3-storage.service';

@Module({
  providers: [
    EnvService,
    {
      provide: S3Client,
      useFactory: (env: EnvService) => {
        const region = 'us-east-1';
        const credentials = {
          accessKeyId: env.get('STORAGE_ACCESS_KEY_ID'),
          secretAccessKey: env.get('STORAGE_SECRET_ACCESS_KEY'),
        };

        return new S3Client({
          endpoint: env.get('STORAGE_URL'),
          region,
          forcePathStyle: true,
          credentials,
        });
      },
      inject: [EnvService],
    },
    S3StorageService,
  ],
  exports: [S3Client, S3StorageService],
})
export class StorageModule {}
