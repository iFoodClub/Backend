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
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// Classes para validação de objetos aninhados
export class CompanyDataDto {
  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  cep: string;

  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  number: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID do restaurante deve ser um número' })
  @IsInt({ message: 'ID do restaurante deve ser um número inteiro' })
  @Min(1, { message: 'ID do restaurante deve ser maior que 0' })
  restaurantId?: number | null;
}

export class CreateCompanyUserDto {
  @ApiProperty({
    description: 'Tipo de usuário (deve ser "company")',
    example: 'company',
    enum: ['company'],
  })
  @IsEnum(['company'], { message: 'Tipo de usuário deve ser company' })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  userType: 'company';

  @ApiProperty({
    type: 'string',
    description: 'Nome da empresa',
    example: 'Empresa XYZ Ltda',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Email da empresa',
    example: 'empresa.xyz+003@example.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Senha da empresa',
    example: 'senha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    type: String,
    example: '88937652000101',
  })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  cnpj: string;

  @ApiProperty({
    description: 'Dados específicos da empresa',
    type: 'object',
    example: {
      cep: '12345678',
      number: '100',
      restaurantId: null,
    },
  })
  @ValidateNested()
  @Type(() => CompanyDataDto)
  company: CompanyDataDto;
}
