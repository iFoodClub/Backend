import { ApiProperty } from '@nestjs/swagger';

export class Http400 {
  @ApiProperty({
    description: 'Sucesso = false',
    type: Boolean,
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensagem de erro',
    type: String,
    example: 'Todos os campos são obrigatórios.',
  })
  message: string;
}
