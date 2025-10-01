import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class SendOrdersDto {
  @ApiProperty({
    description: 'Array com os IDs dos pedidos a serem enviados',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  orderIds: number[];
} 