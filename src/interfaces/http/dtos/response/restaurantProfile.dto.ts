import { ApiProperty } from '@nestjs/swagger';

export class RestaurantProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  userId: number;

  @ApiProperty({ example: 'Sabores do Chef' })
  name: string;

  @ApiProperty({
    example: '12.345.678/0001-90',
    description: 'CNPJ do restaurante (não editável)',
  })
  cnpj: string;

  @ApiProperty({ example: '12345-678' })
  cep: string;

  @ApiProperty({ example: 'Rua das Flores' })
  rua: string;

  @ApiProperty({ example: 'São Paulo' })
  cidade: string;

  @ApiProperty({ example: 'SP' })
  estado: string;

  @ApiProperty({ example: '123' })
  number: string;

  @ApiProperty({ example: 'Sala 101', required: false })
  complemento?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  phone?: string;

  @ApiProperty({ example: 'contato@restaurante.com' })
  email: string;

  @ApiProperty({
    example: 'novo@restaurante.com',
    required: false,
    description: 'E-mail aguardando confirmação por link de verificação',
  })
  pendingEmail?: string;

  @ApiProperty({ example: 'https://.../profile.jpg', required: false })
  profileImage?: string;
}
