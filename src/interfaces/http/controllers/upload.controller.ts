import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { S3UploadService } from '../../../infrastructure/services/s3-upload.service';
import {
  UploadImageRequestDto,
  DeleteImageRequestDto,
} from '../dtos/request/upload-request.dto';

import {
  UploadImageResponseDto,
  DeleteImageResponseDto,
} from '../dtos/response/upload-response.dto';

@ApiTags('Upload de Imagens')
@ApiExtraModels(
  UploadImageRequestDto,
  UploadImageResponseDto,
  DeleteImageRequestDto,
  DeleteImageResponseDto,
)
@Controller('upload')
export class UploadController {
  constructor(private readonly s3UploadService: S3UploadService) {}

  @Post('image/:folder')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload de imagem para o S3',
    description: `
      Faz upload de uma imagem para o bucket AWS S3.
      
      **Pastas disponíveis:**
      - \`dishes\` - Fotos de pratos dos restaurantes
      - \`users\` - Fotos de perfil de usuários/funcionários
      - \`restaurants\` - Fotos de perfil dos restaurantes
      - \`companies\` - Logos das empresas
      
      **Tipos aceitos:** JPEG, PNG, GIF, WebP
      **Tamanho máximo:** 5MB
      
      **Como usar no Swagger:**
      1. Clique em "Try it out"
      2. Escolha a pasta (folder) no dropdown
      3. Clique em "Choose File" e selecione sua imagem
      4. Clique em "Execute"
      
      **Como usar com cURL:**
      \`\`\`bash
      curl -X POST "http://localhost:3000/upload/image/dishes" \\
        -H "Content-Type: multipart/form-data" \\
        -F "file=@/path/to/image.jpg"
      \`\`\`
      
      **Como usar no código (JavaScript/TypeScript):**
      \`\`\`javascript
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3000/upload/image/dishes', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('URL da imagem:', data.data.url);
      \`\`\`
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'folder',
    description: 'Pasta de destino no S3',
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
          url: 'https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1697123456789-abc123.jpg',
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
        message: 'Erro ao fazer upload: falha na conexão com S3',
        error: 'Internal Server Error',
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Valida se é uma imagem
    if (!this.s3UploadService.isValidImageFile(file)) {
      throw new BadRequestException(
        'O arquivo deve ser uma imagem (JPEG, PNG, GIF ou WebP)',
      );
    }

    // Valida o tamanho (máximo 5MB)
    if (!this.s3UploadService.isValidFileSize(file, 5)) {
      throw new BadRequestException('O arquivo deve ter no máximo 5MB');
    }

    // Valida a pasta
    const allowedFolders = ['dishes', 'users', 'restaurants', 'companies'];
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException(
        `Pasta inválida. Use uma das seguintes: ${allowedFolders.join(', ')}`,
      );
    }

    try {
      const result = await this.s3UploadService.uploadFile(file, folder);

      return {
        success: true,
        message: 'Imagem enviada com sucesso',
        data: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(`Erro ao fazer upload: ${errorMessage}`);
    }
  }

  @Delete('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deletar imagem do S3',
    description: `
      Remove permanentemente uma imagem do bucket AWS S3.
      
      **⚠️ ATENÇÃO:** Esta ação não pode ser desfeita!
      
      **Como obter a chave (key):**
      - A chave é retornada no campo \`data.key\` quando você faz o upload
      - Exemplo: \`dishes/1697123456789-abc123.jpg\`
      
      **Como usar no Swagger:**
      1. Clique em "Try it out"
      2. Cole a chave do arquivo no campo "key"
      3. Clique em "Execute"
      
      **Como usar com cURL:**
      \`\`\`bash
      curl -X DELETE "http://localhost:3000/upload/image" \\
        -H "Content-Type: application/json" \\
        -d '{"key": "dishes/1697123456789-abc123.jpg"}'
      \`\`\`
      
      **Como usar no código (JavaScript/TypeScript):**
      \`\`\`javascript
      const response = await fetch('http://localhost:3000/upload/image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'dishes/1697123456789-abc123.jpg'
        })
      });
      
      const data = await response.json();
      console.log(data.message);
      \`\`\`
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
    description: 'Erro ao deletar imagem',
  })
  async deleteImage(@Body() body: { key: string }) {
    if (!body.key) {
      throw new BadRequestException('A chave do arquivo é obrigatória');
    }

    try {
      await this.s3UploadService.deleteFile(body.key);

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
