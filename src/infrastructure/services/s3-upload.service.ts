import { Injectable, Logger } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobDownloadResponseParsed,
  BlobServiceClient,
  BlockBlobClient,
} from '@azure/storage-blob';

@Injectable()
export class AzureBlobUploadService {
  private readonly logger = new Logger(AzureBlobUploadService.name);
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly accountName: string;

  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'app-uploads';

    if (!this.accountName) {
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME is required');
    }

    const accountUrl =
      process.env.AZURE_STORAGE_ACCOUNT_URL ||
      `https://${this.accountName}.blob.core.windows.net`;
    const credential = new DefaultAzureCredential(
      process.env.AZURE_CLIENT_ID
        ? { managedIdentityClientId: process.env.AZURE_CLIENT_ID }
        : undefined,
    );

    this.blobServiceClient = new BlobServiceClient(accountUrl, credential);

    this.logger.log(
      `Azure Blob Upload Service initialized for container: ${this.containerName}`,
    );
  }

  /**
   * Faz upload de um arquivo para o Blob Storage
   * @param file - Arquivo do multer
   * @param folder - Pasta lógica no Blob (ex: 'dishes', 'users', 'restaurants')
   * @returns Chave do arquivo armazenado
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ key: string }> {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      this.logger.log(`Uploading file: ${file.originalname} to ${key}`);

      const blobClient = this.getBlockBlobClient(key);
      await blobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      this.logger.log(`File uploaded successfully: ${key}`);

      return { key };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.error(`Error uploading file: ${errorMessage}`);
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Deleta um arquivo do Blob Storage
   * @param key - Chave do arquivo no Blob
   */
  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${key}`);

      const blobClient = this.getBlockBlobClient(key);
      await blobClient.deleteIfExists();

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.error(`Error deleting file: ${errorMessage}`);
      throw new Error(`Failed to delete file: ${errorMessage}`);
    }
  }

  /**
   * Faz download de um arquivo do Blob Storage para ser servido pela API
   * @param key - Chave do arquivo no Blob
   */
  async downloadFile(key: string): Promise<{
    stream: NonNullable<BlobDownloadResponseParsed['readableStreamBody']>;
    contentType?: string;
    contentLength?: number;
  }> {
    try {
      const blobClient = this.getBlockBlobClient(key);
      const response = await blobClient.download();

      if (!response.readableStreamBody) {
        throw new Error('Blob stream indisponível');
      }

      return {
        stream: response.readableStreamBody,
        contentType: response.contentType,
        contentLength: response.contentLength,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.error(`Error downloading file: ${errorMessage}`);
      throw new Error(`Failed to download file: ${errorMessage}`);
    }
  }

  /**
   * Valida se o arquivo é uma imagem
   */
  isValidImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/webp',
    ];
    return allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * Valida o tamanho do arquivo (padrão: 5MB)
   */
  isValidFileSize(file: Express.Multer.File, maxSizeInMB: number = 5): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  private getContainerClient() {
    return this.blobServiceClient.getContainerClient(this.containerName);
  }

  private getBlockBlobClient(key: string): BlockBlobClient {
    return this.getContainerClient().getBlockBlobClient(key);
  }
}
