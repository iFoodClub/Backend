import {
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { AzureBlobUploadService } from '../../../infrastructure/services/s3-upload.service';
import {
  UploadImageRequestDto,
  DeleteImageRequestDto,
} from '../dtos/request/upload-request.dto';
import {
  UploadImageResponseDto,
  DeleteImageResponseDto,
} from '../dtos/response/upload-response.dto';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { UploadAuthorizationGuard } from 'src/infrastructure/guards/upload-authorization.guard';
import { UploadOwnershipGuard } from 'src/infrastructure/guards/upload-ownership.guard';

@ApiTags('Upload de Imagens')
@ApiExtraModels(
  UploadImageRequestDto,
  UploadImageResponseDto,
  DeleteImageRequestDto,
  DeleteImageResponseDto,
)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly azureBlobUploadService: AzureBlobUploadService,
  ) {}

  private buildPublicImageUrl(request: Request, key: string): string {
    const forwardedProto = request.get('x-forwarded-proto');
    const protocol = forwardedProto?.split(',')[0]?.trim() || request.protocol;
    const host = request.get('host');

    return `${protocol}://${host}/upload/image?key=${encodeURIComponent(key)}`;
  }

  @Get('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter imagem armazenada no Blob Storage',
    description: 'Retorna a imagem salva no Blob Storage via proxy do backend.',
  })
  @ApiQuery({
    name: 'key',
    required: true,
    description: 'Chave do arquivo no Blob Storage',
    example: 'dishes/1697123456789-abc123.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagem retornada com sucesso',
  })
  async getImage(
    @Query('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!key) {
      throw new BadRequestException('A chave do arquivo é obrigatória');
    }

    const file = await this.azureBlobUploadService.downloadFile(key);

    res.setHeader(
      'Content-Type',
      file.contentType || 'application/octet-stream',
    );
    if (file.contentLength !== undefined) {
      res.setHeader('Content-Length', file.contentLength.toString());
    }
    res.setHeader('Cache-Control', 'private, max-age=300');

    const nodeStream = file.stream as unknown as Readable;
    return new StreamableFile(nodeStream);
  }

  @Post('image/:folder')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload de imagem para o Azure Blob Storage',
    description: `
      Faz upload de uma imagem para o Azure Blob Storage.
      
      **Pastas disponíveis:**
      - \`dishes\` - Fotos de pratos dos restaurantes
      - \`users\` - Fotos de perfil de usuários/funcionários
      - \`restaurants\` - Fotos de perfil dos restaurantes
      - \`companies\` - Logos das empresas
      
      **Tipos aceitos:** JPEG, PNG, GIF, WebP
      **Tamanho máximo:** 5MB
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'folder',
    description: 'Pasta lógica de destino no Blob Storage',
    example: 'dishes',
    enum: ['dishes', 'users', 'restaurants', 'companies'],
    required: true,
    schema: {
      type: 'string',
      enum: ['dishes', 'users', 'restaurants', 'companies'],
      default: 'dishes',
    },
  })
  @ApiBody({
    description: 'Selecione o arquivo de imagem para upload',
    required: true,
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            '📎 Clique em "Choose File" para selecionar uma imagem do seu computador',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '✅ Imagem enviada com sucesso',
    type: UploadImageResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url: 'http://localhost:3000/upload/image?key=dishes%2F1697123456789-abc123.jpg',
          key: 'dishes/1697123456789-abc123.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ Erro na validação do arquivo',
    schema: {
      example: {
        statusCode: 400,
        message: 'O arquivo deve ser uma imagem (JPEG, PNG, GIF ou WebP)',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '❌ Erro interno do servidor',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro ao fazer upload: Failed to upload file: ...',
        error: 'Internal Server Error',
      },
    },
  })
  async uploadImage(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (!this.azureBlobUploadService.isValidImageFile(file)) {
      throw new BadRequestException(
        'O arquivo deve ser uma imagem (JPEG, PNG, GIF ou WebP)',
      );
    }

    if (!this.azureBlobUploadService.isValidFileSize(file, 5)) {
      throw new BadRequestException('O arquivo deve ter no máximo 5MB');
    }

    const allowedFolders = ['dishes', 'users', 'restaurants', 'companies'];
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException(
        `Pasta inválida. Use uma das seguintes: ${allowedFolders.join(', ')}`,
      );
    }

    try {
      const result = await this.azureBlobUploadService.uploadFile(file, folder);
      const url = this.buildPublicImageUrl(request, result.key);

      return {
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          url,
          key: result.key,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(`Erro ao fazer upload: ${errorMessage}`);
    }
  }

  @Delete('image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar imagem do Azure Blob Storage',
    description: `
      Remove permanentemente uma imagem do Azure Blob Storage.
      
      **⚠️ ATENÇÃO:** Esta ação não pode ser desfeita!
    `,
  })
  @ApiBody({
    description: 'Chave do arquivo que será deletado',
    type: DeleteImageRequestDto,
    required: true,
    schema: {
      example: {
        key: 'dishes/1697123456789-abc123.jpg',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '✅ Imagem deletada com sucesso',
    type: DeleteImageResponseDto,
    schema: {
      example: {
        success: true,
        message: { type: 'string', example: 'Imagem deletada com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ Erro ao deletar imagem',
  })
  async deleteImage(@Body() body: { key: string }) {
    if (!body.key) {
      throw new BadRequestException('A chave do arquivo é obrigatória');
    }

    try {
      await this.azureBlobUploadService.deleteFile(body.key);

      return {
        success: true,
        message: 'Imagem deletada com sucesso',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(`Erro ao deletar imagem: ${errorMessage}`);
    }
  }
}
