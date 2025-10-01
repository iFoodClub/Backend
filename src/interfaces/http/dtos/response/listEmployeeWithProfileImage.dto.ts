import { ApiProperty } from '@nestjs/swagger';

export class ListEmployeeWithProfileImageDto {
  @ApiProperty({
    description: 'ID do funcionário',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'Nome do funcionário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'CPF do funcionário',
    example: '12345678901',
  })
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-01-01',
  })
  birthDate: Date;

  @ApiProperty({
    description: 'Status de férias',
    example: false,
  })
  vacation: boolean;

  @ApiProperty({
    description: 'Imagem de perfil do funcionário',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImage?: string;
} 