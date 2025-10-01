import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { IndividualOrderStatus } from '../../../../domain/repositories/individual-order.repository.interface';

export class UpdateIndividualOrderStatusDto {
  @ApiProperty({
    description: 'ID do pedido individual',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Novo status do pedido',
    enum: IndividualOrderStatus,
    example: IndividualOrderStatus.COMPLETED,
  })
  @IsEnum(IndividualOrderStatus)
  status: IndividualOrderStatus;
} 