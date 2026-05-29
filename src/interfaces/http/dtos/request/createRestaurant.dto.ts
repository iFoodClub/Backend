import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({
    description: 'ID do usuário que está criando o restaurante',
    type: Number,
    example: 1,
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'Nome do restaurante',
    type: String,
    example: 'Sabores do Chef',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'CNPJ do restaurante',
    type: String,
    example: '12.345.678/0001-90',
  })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({
    description: 'CEP do restaurante',
    type: String,
    example: '12345-678',
  })
  @IsNotEmpty()
  @IsString()
  cep: string;

  @ApiProperty({
    description: 'Rua do restaurante',
    type: String,
    example: 'Rua das Flores',
  })
  @IsNotEmpty()
  @IsString()
  rua: string;

  @ApiProperty({
    description: 'Cidade do restaurante',
    type: String,
    example: 'São Paulo',
  })
  @IsNotEmpty()
  @IsString()
  cidade: string;

  @ApiProperty({
    description: 'Estado do restaurante (sigla)',
    type: String,
    example: 'SP',
  })
  @IsNotEmpty()
  @IsString()
  estado: string;

  @ApiProperty({
    description: 'Número do restaurante',
    type: String,
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    type: String,
    example: 'Sala 101',
    required: false,
  })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({
    description: 'URL da imagem do restaurante',
    type: String,
    example:
      'https://www.tripadvisor.com.br/Restaurant_Review-g303235-d12083289-Reviews-Sabores_do_Chef_Picanharia-Manaus_Amazon_River_State_of_Amazonas.html',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({
    description: 'Horário de abertura (HH:mm)',
    type: String,
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiProperty({
    description: 'Horário de fechamento (HH:mm)',
    type: String,
    example: '18:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  closingTime?: string;
}
