import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  ValidateNested,
  IsDateString,
  IsNumber,
  IsInt,
  Min,
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

export class CompanyDataDto {
  @IsNumber({}, { message: 'ID da empresa deve ser um número' })
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  @Min(1, { message: 'ID da empresa deve ser maior que 0' })
  id: number;
}

export class CreateEmployeeUserDto {
  @ApiProperty({
    description: 'Tipo de usuário (deve ser "employee")',
    example: 'employee',
    enum: ['employee'],
  })
  @IsEnum(['employee'], { message: 'Tipo de usuário deve ser employee' })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  userType: 'employee';

  @ApiProperty({
    type: 'string',
    description: 'Nome do funcionário',
    example: 'João da Silva',
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'Email do funcionário',
    example: 'joao.silva@email.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'Senha do funcionário',
    example: 'senha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;

  @ApiProperty({
    description: 'CPF do funcionário',
    type: String,
    example: '12345678901',
  })
  @IsString({ message: 'CPF deve ser uma string' })
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  cpf: string;

  @ApiProperty({
    description: 'Dados específicos do funcionário',
    type: 'object',
    example: {
      name: 'João da Silva',
      birthDate: '1990-05-10',
    },
  })
  @ValidateNested()
  @Type(() => EmployeeDataDto)
  employee: EmployeeDataDto;

  @ApiProperty({
    description: 'Dados da empresa associada',
    type: 'object',
    example: {
      id: 1,
    },
  })
  @ValidateNested()
  @Type(() => CompanyDataDto)
  company: CompanyDataDto;
}
