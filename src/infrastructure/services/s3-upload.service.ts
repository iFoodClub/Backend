import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3UploadService {
  private readonly logger = new Logger(S3UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'foodclub-uploads';
    this.region = process.env.AWS_REGION || 'sa-east-1';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.logger.log(
      `S3 Upload Service initialized for bucket: ${this.bucketName}`,
    );
  }

  /**
   * Faz upload de um arquivo para o S3
   * @param file - Arquivo do multer
   * @param folder - Pasta no S3 (ex: 'dishes', 'users', 'restaurants')
   * @returns URL pública do arquivo ou chave do arquivo
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    try {
      // Gera um nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      this.logger.log(`Uploading file: ${file.originalname} to ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Torna o arquivo público
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${url}`);

      return { url, key };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Deleta um arquivo do S3
   * @param key - Chave do arquivo no S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gera uma URL assinada temporária para acesso privado
   * @param key - Chave do arquivo no S3
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Error generating signed URL: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to generate signed URL: ${error.message}`);
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
}
