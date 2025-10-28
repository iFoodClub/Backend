import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Nome da empresa',
    type: String,
    example: 'Food Club',
  })
  company_name: string;

  @ApiProperty({
    description: 'CEP da empresa',
    type: String,
    example: '12345-678',
  })
  zip_code: string;

  @ApiProperty({
    description: 'Rua da empresa',
    type: String,
    example: 'Avenida Paulista',
  })
  street: string;

  @ApiProperty({
    description: 'Número da empresa',
    type: String,
    example: '1000',
  })
  number: string;

  @ApiProperty({
    description: 'Cidade da empresa',
    type: String,
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    type: String,
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Estado da empresa',
    type: String,
    example: 'SP',
  })
  state: string;
}
