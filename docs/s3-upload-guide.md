# 📤 Guia de Upload para S3 - FoodClub Backend

Este guia explica como usar o serviço de upload de imagens para o AWS S3.

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=foodclub-uploads
```

### 2. Permissões do Bucket S3

Certifique-se de que seu bucket tem as seguintes configurações:

- **Block Public Access**: Desabilitado (para arquivos públicos)
- **ACL**: Habilitado
- **CORS Configuration**: Configurado para aceitar uploads

Exemplo de CORS Configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. IAM Policy para o Usuário

O usuário IAM precisa ter permissões para:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::foodclub-uploads/*"
    }
  ]
}
```

## 📝 Como Usar

### Upload de Imagem

**Endpoint:** `POST /upload/image/:folder`

**Pastas disponíveis:**
- `dishes` - Imagens de pratos
- `users` - Fotos de perfil de usuários
- `restaurants` - Imagens de restaurantes
- `companies` - Logos de empresas

**Exemplo com cURL:**

```bash
curl -X POST \
  http://localhost:3000/upload/image/dishes \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/image.jpg'
```

**Exemplo com Postman:**

1. Método: POST
2. URL: `http://localhost:3000/upload/image/dishes`
3. Body: 
   - Selecione `form-data`
   - Key: `file` (tipo: File)
   - Value: Selecione seu arquivo

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "url": "https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1234567890-abc123.jpg",
    "key": "dishes/1234567890-abc123.jpg"
  }
}
```

### Deletar Imagem

**Endpoint:** `DELETE /upload/image`

**Exemplo com cURL:**

```bash
curl -X DELETE \
  http://localhost:3000/upload/image \
  -H 'Content-Type: application/json' \
  -d '{
    "key": "dishes/1234567890-abc123.jpg"
  }'
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Imagem deletada com sucesso"
}
```

## 🔒 Validações

### Tipos de Arquivo Aceitos
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### Tamanho Máximo
- 5MB por arquivo

### Pastas Permitidas
- `dishes`
- `users`
- `restaurants`
- `companies`

## 🛠️ Usando no Código

### Injetando o Serviço

```typescript
import { Injectable } from '@nestjs/common';
import { S3UploadService } from './infrastructure/services/s3-upload.service';

@Injectable()
export class MeuService {
  constructor(private readonly s3UploadService: S3UploadService) {}

  async uploadImage(file: Express.Multer.File) {
    // Upload para a pasta 'dishes'
    const result = await this.s3UploadService.uploadFile(file, 'dishes');
    
    console.log('URL da imagem:', result.url);
    console.log('Key no S3:', result.key);
    
    return result;
  }

  async deleteImage(key: string) {
    await this.s3UploadService.deleteFile(key);
  }
}
```

### Exemplo em um Controller

```typescript
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3UploadService } from '../infrastructure/services/s3-upload.service';

@Controller('dishes')
export class DishController {
  constructor(private readonly s3UploadService: S3UploadService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDishImage(@UploadedFile() file: Express.Multer.File) {
    // Validar arquivo
    if (!this.s3UploadService.isValidImageFile(file)) {
      throw new BadRequestException('Arquivo inválido');
    }

    // Fazer upload
    const result = await this.s3UploadService.uploadFile(file, 'dishes');
    
    return {
      imageUrl: result.url,
      imageKey: result.key,
    };
  }
}
```

## 🌐 Integração com Frontend

### React/Next.js

```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/upload/image/dishes', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.data.url; // URL da imagem
}
```

### Vue.js

```typescript
async uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'http://localhost:3000/upload/image/dishes',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.url;
  } catch (error) {
    console.error('Erro no upload:', error);
  }
}
```

## 📊 Swagger/OpenAPI

A documentação completa está disponível em:
`http://localhost:3000/api`

Procure pela seção **"Upload API"** para testar os endpoints interativamente.

## 🐛 Troubleshooting

### Erro: "Access Denied"
- Verifique as credenciais AWS no `.env`
- Confirme as permissões IAM do usuário

### Erro: "NoSuchBucket"
- Verifique se o bucket existe
- Confirme o nome do bucket no `.env`

### Erro: "Access Control List"
- Habilite ACLs no bucket S3
- Verifique as permissões de ACL do usuário IAM

### Imagem não aparece pública
- Verifique se o ACL está configurado como `public-read`
- Desabilite "Block Public Access" no bucket

## 🔐 Segurança

### URLs Privadas (Opcional)

Se precisar de URLs temporárias:

```typescript
// Gera URL assinada válida por 1 hora
const signedUrl = await this.s3UploadService.getSignedUrl(
  'dishes/1234567890-abc123.jpg',
  3600 // segundos
);
```

## 📚 Recursos Adicionais

- [AWS SDK v3 Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
