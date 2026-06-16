import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty({
    description: 'Novo e-mail de contato do restaurante',
    type: String,
    example: 'novo-email@restaurante.com',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'O novo e-mail é obrigatório' })
  newEmail: string;
}
