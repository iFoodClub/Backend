import { ApiProperty } from '@nestjs/swagger';

export class UploadImageRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem para upload',
    example: 'selecione um arquivo de imagem',
  })
  file: Express.Multer.File;
}

export class DeleteImageRequestDto {
  @ApiProperty({
    example: 'dishes/1697123456789-abc123.jpg',
    description: 'Chave do arquivo no Blob Storage que será deletado',
  })
  key: string;
}
