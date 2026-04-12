import { S3UploadService } from '../services/s3-upload.service';

export const s3UploadProvider = [
  {
    provide: 'S3_UPLOAD_SERVICE',
    useClass: S3UploadService,
  },
];
