import { AzureBlobUploadService } from '../services/blob-upload.service';

export const azureBlobUploadProvider = [
  {
    provide: 'AZURE_BLOB_UPLOAD_SERVICE',
    useClass: AzureBlobUploadService,
  },
];
