import { Injectable, Logger } from '@nestjs/common';
import { DefaultAzureCredential } from '@azure/identity';
import {
  BlobDownloadResponseParsed,
  BlobServiceClient,
  StorageSharedKeyCredential,
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
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const credential = storageAccountKey
      ? new StorageSharedKeyCredential(this.accountName, storageAccountKey)
      : new DefaultAzureCredential(
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
   * @param folder - Pasta lógica no Blob (ex: 'pratos', 'perfis', 'funcionarios')
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
      const { containerClient, blobName, key } = await this.resolveUploadTarget(
        folder,
        fileName,
      );

      this.logger.log(`Uploading file: ${file.originalname} to ${key}`);

      // Se existir um container com o mesmo nome da pasta, salva no root do container.
      // Caso contrário, usa o container padrão e grava em uma 'pasta' lógica.
      const blobClient = containerClient.getBlockBlobClient(blobName);

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

      const { containerClient, blobName } =
        await this.getContainerAndBlobFromKey(key);

      const blobClient = containerClient.getBlockBlobClient(blobName);
      const deleteResponse = await blobClient.deleteIfExists();

      if (!deleteResponse.succeeded && blobName !== key) {
        const legacyBlobClient = containerClient.getBlockBlobClient(key);
        await legacyBlobClient.deleteIfExists();
      }

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
      const { containerClient, blobName } =
        await this.getContainerAndBlobFromKey(key);

      const blobClient = containerClient.getBlockBlobClient(blobName);
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

  private async getContainerClientFor(folder: string) {
    const candidate = this.blobServiceClient.getContainerClient(folder);
    try {
      const exists = await candidate.exists();
      if (exists) return candidate;
    } catch (error) {
      void error;
      // ignora e usa o container padrão
    }

    return this.getContainerClient();
  }

  private async resolveUploadTarget(folder: string, fileName: string) {
    const key = `${folder}/${fileName}`;
    const candidate = this.blobServiceClient.getContainerClient(folder);

    try {
      if (await candidate.exists()) {
        return { containerClient: candidate, blobName: fileName, key };
      }
    } catch (error) {
      void error;
      // ignore e usa o container padrão
    }

    return { containerClient: this.getContainerClient(), blobName: key, key };
  }

  private async getContainerAndBlobFromKey(key: string) {
    // Se a chave começar com 'containerName/...' e esse container existir,
    // separamos container e blobName. Caso contrário, usamos o container padrão.
    const parts = key.split('/');
    if (parts.length > 1) {
      const possibleContainer = parts[0];
      const candidate =
        this.blobServiceClient.getContainerClient(possibleContainer);
      try {
        if (await candidate.exists()) {
          return {
            containerClient: candidate,
            blobName: parts.slice(1).join('/'),
          };
        }
      } catch (error) {
        void error;
        // ignore
      }
    }

    return { containerClient: this.getContainerClient(), blobName: key };
  }
}
