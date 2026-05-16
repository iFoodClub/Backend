import { AzureBlobUploadService } from '../services/s3-upload.service';

export const azureBlobUploadProvider = [
  {
    provide: 'AZURE_BLOB_UPLOAD_SERVICE',
    useClass: AzureBlobUploadService,
  },
];
