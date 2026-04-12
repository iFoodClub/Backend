import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'Senha do usuário',
    type: String,
    example: 'Password123!',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;
}
