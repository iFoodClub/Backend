import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateRestaurantProfileDto {
  @ApiProperty({
    description: 'Nome do restaurante',
    type: String,
    example: 'Sabores do Chef',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do restaurante é obrigatório' })
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'CEP do restaurante',
    type: String,
    example: '12345-678',
  })
  @IsString()
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato 00000-000 ou 00000000',
  })
  cep: string;

  @ApiProperty({
    description: 'Rua do restaurante',
    type: String,
    example: 'Rua das Flores',
  })
  @IsString()
  @IsNotEmpty({ message: 'A rua é obrigatória' })
  @MaxLength(200)
  rua: string;

  @ApiProperty({
    description: 'Cidade do restaurante',
    type: String,
    example: 'São Paulo',
  })
  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatória' })
  @MaxLength(100)
  cidade: string;

  @ApiProperty({
    description: 'Estado do restaurante (UF com 2 letras)',
    type: String,
    example: 'SP',
  })
  @IsString()
  @IsNotEmpty({ message: 'O estado é obrigatório' })
  @Length(2, 2, { message: 'Estado deve ser a sigla com 2 letras' })
  estado: string;

  @ApiProperty({
    description: 'Número do endereço',
    type: String,
    example: '123',
  })
  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório' })
  @MaxLength(10)
  number: string;

  @ApiProperty({
    description: 'Complemento do endereço',
    type: String,
    example: 'Sala 101',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  complemento?: string;

  @ApiProperty({
    description: 'Telefone de contato do restaurante',
    type: String,
    example: '(11) 99999-9999',
  })
  @IsString()
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @Matches(/^[\d\s()+-]{8,20}$/, {
    message: 'Telefone deve conter apenas dígitos, espaços, parênteses, + e -',
  })
  phone: string;

  @ApiProperty({
    description: 'URL/caminho da foto de perfil',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profileImage?: string;
}
