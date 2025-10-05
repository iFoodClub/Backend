import { ApiProperty } from '@nestjs/swagger';

export class Http404 {
  @ApiProperty({
    description: 'Sucesso = false',
    type: Boolean,
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
    example: 'Registro não encontrado',
  })
  message: string;
}