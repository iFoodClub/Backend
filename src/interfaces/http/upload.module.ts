import { Module } from '@nestjs/common';
import { S3UploadService } from '../../infrastructure/services/s3-upload.service';
import { s3UploadProvider } from '../../infrastructure/providers/s3-upload.provider';
import { UploadController } from './controllers/upload.controller';

@Module({
  controllers: [UploadController],
  providers: [S3UploadService, ...s3UploadProvider],
  exports: [S3UploadService],
})
export class UploadModule {}
