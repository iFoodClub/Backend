import { ApiProperty } from '@nestjs/swagger';
import { UserType } from 'src/domain/repositories/user.repository.interface';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Classes para validação de objetos aninhados
export class EmployeeDataDto {
  @IsString({ message: 'Nome do funcionário deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do funcionário é obrigatório' })
  @MinLength(2, {
    message: 'Nome do funcionário deve ter pelo menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'Nome do funcionário deve ter no máximo 100 caracteres',
  })
  name: string;

  @IsDateString(
    {},
    { message: 'Data de nascimento deve ter formato válido (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  birthDate: string;
}

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

  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  number: string;
}

export class CompanyDataDto {
  @IsString({ message: 'Nome da empresa deve ser uma string' })
  @IsNotEmpty({ message: 'Nome da empresa é obrigatório' })
  @MinLength(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' })
  @MaxLength(100, {
    message: 'Nome da empresa deve ter no máximo 100 caracteres',
  })
  name: string;

  @IsString({ message: 'CEP deve ser uma string' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  cep: string;

  @IsString({ message: 'Número deve ser uma string' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @MaxLength(10, { message: 'Número deve ter no máximo 10 caracteres' })
  number: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Tipo de usuário (employee, restaurant, company)',
    type: UserType,
    example: 'employee',
    enum: UserType,
    enumName: 'UserType',
  })
  @IsEnum(UserType, {
    message: 'Tipo de usuário deve ser employee, restaurant ou company',
  })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  userType: UserType;

  @ApiProperty({
    type: 'string',
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Email do usuário',
    example: 'joao.silva@email.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;

  @ApiProperty({
    description: 'CPF do usuário (obrigatório para employee)',
    type: String,
    example: '12345678901',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CPF deve ser uma string' })
  cpf?: string;

  @ApiProperty({
    description: 'CNPJ do usuário (obrigatório para restaurant e company)',
    type: String,
    example: '98765432000188',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  cnpj?: string;

  @ApiProperty({
    description:
      'Dados específicos do funcionário (obrigatório quando userType = employee)',
    type: 'object',
    example: {
      name: 'João da Silva',
      birthDate: '1990-05-10',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmployeeDataDto)
  employee?: EmployeeDataDto;

  @ApiProperty({
    description:
      'Dados específicos do restaurante (obrigatório quando userType = restaurant)',
    type: 'object',
    example: {
      name: 'Restaurante Saboroso',
      cep: '87654321',
      number: '200',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RestaurantDataDto)
  restaurant?: RestaurantDataDto;

  @ApiProperty({
    description:
      'Dados específicos da empresa (obrigatório quando userType = company)',
    type: 'object',
    example: {
      name: 'Empresa ABC Ltda',
      cep: '12345678',
      number: '100',
    },
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDataDto)
  company?: CompanyDataDto;
}
