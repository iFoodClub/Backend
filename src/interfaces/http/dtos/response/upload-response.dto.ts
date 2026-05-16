import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se o upload foi bem-sucedido',
  })
  success: boolean;

  @ApiProperty({
    example: 'Imagem enviada com sucesso',
    description: 'Mensagem de resposta',
  })
  message: string;

  @ApiProperty({
    example: {
      url: 'http://localhost:3000/upload/image?key=dishes%2F1697123456789-abc123.jpg',
      key: 'dishes/1697123456789-abc123.jpg',
    },
    description: 'Dados da imagem enviada',
  })
  data: {
    url: string;
    key: string;
  };
}

export class DeleteImageResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se a deleção foi bem-sucedida',
  })
  success: boolean;

  @ApiProperty({
    example: 'Imagem deletada com sucesso',
    description: 'Mensagem de resposta',
  })
  message: string;
}
