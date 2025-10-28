import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// Classes para validação de objetos aninhados
export class RestaurantDataDto {
  @IsString({ message: 'Nome do restaurante deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do restaurante é obrigatório' })
  @MinLength(2, {
    message: 'Nome do restaurante deve ter pelo menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'Nome do restaurante deve ter no máximo 100 caracteres',
  })
  name: string;

  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  cep: string;

  @IsString({ message: 'Rua deve ser uma string' })
  @IsNotEmpty({ message: 'Rua é obrigatória' })
  @MinLength(2, { message: 'Rua deve ter pelo menos 2 caracteres' })
  @MaxLength(200, { message: 'Rua deve ter no máximo 200 caracteres' })
  rua: string;

  @IsString({ message: 'Cidade deve ser uma string' })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @MinLength(2, { message: 'Cidade deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
  cidade: string;

  @IsString({ message: 'Estado deve ser uma string' })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  estado: string;

  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  number: string;

  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(200, { message: 'Complemento deve ter no máximo 200 caracteres' })
  complemento?: string;
}

export class CreateRestaurantUserDto {
  @ApiProperty({
    description: 'Tipo de usuário (deve ser "restaurant")',
    example: 'restaurant',
    enum: ['restaurant'],
  })
  @IsEnum(['restaurant'], { message: 'Tipo de usuário deve ser restaurant' })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  userType: 'restaurant';

  @ApiProperty({
    type: 'string',
    description: 'Nome do restaurante',
    example: 'Restaurante Saboroso',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Email do restaurante',
    example: 'restaurante@email.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Senha do restaurante',
    example: 'senha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;

  @ApiProperty({
    description: 'CNPJ do restaurante',
    type: String,
    example: '98765432000188',
  })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  cnpj: string;

  @ApiProperty({
    description: 'Dados específicos do restaurante',
    type: 'object',
    example: {
      name: 'Restaurante Saboroso',
      cep: '87654321',
      rua: 'Rua das Flores',
      cidade: 'São Paulo',
      estado: 'SP',
      number: '200',
      complemento: 'Sala 101',
    },
  })
  @ValidateNested()
  @Type(() => RestaurantDataDto)
  restaurant: RestaurantDataDto;
}
