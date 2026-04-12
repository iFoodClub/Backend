import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IndividualOrderStatus } from '../../../../domain/repositories/individual-order.repository.interface';

export class UpdateIndividualOrderStatusDto {
  @ApiProperty({
    description: 'Novo status do pedido',
    enum: IndividualOrderStatus,
    example: IndividualOrderStatus.COMPLETED,
  })
  @IsEnum(IndividualOrderStatus)
  status: IndividualOrderStatus;
}
