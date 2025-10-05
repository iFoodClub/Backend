import { ApiProperty } from '@nestjs/swagger';

export class OrderProgressDto {
  @ApiProperty({
    description: 'ID do pedido da empresa',
    example: 1,
  })
  companyOrderId: number;

  @ApiProperty({
    description: 'Status atual do pedido da empresa',
    example: 'Preparando',
  })
  companyOrderStatus: string;

  @ApiProperty({
    description: 'Total de pedidos individuais',
    example: 5,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Número de pedidos individuais concluídos',
    example: 3,
  })
  completedOrders: number;

  @ApiProperty({
    description: 'Porcentagem de progresso (0-100)',
    example: 60,
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Indica se todos os pedidos individuais estão concluídos',
    example: false,
  })
  isAllCompleted: boolean;
} 