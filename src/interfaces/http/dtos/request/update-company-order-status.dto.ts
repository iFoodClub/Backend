import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { CompanyOrderStatus } from '../../../../domain/repositories/company-order.repository.interface';

export class UpdateCompanyOrderStatusDto {
  @ApiProperty({
    description: 'ID do pedido da empresa',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Novo status do pedido da empresa',
    enum: CompanyOrderStatus,
    example: CompanyOrderStatus.DELIVERED,
  })
  @IsEnum(CompanyOrderStatus)
  status: CompanyOrderStatus;
} 