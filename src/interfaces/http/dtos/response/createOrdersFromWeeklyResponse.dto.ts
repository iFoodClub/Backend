import { ApiProperty } from '@nestjs/swagger';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export class CreateOrdersFromWeeklyResponse {
  @ApiProperty({
    description: 'Mensagem de resultado da operação',
    example: 'Pedidos criados com sucesso baseados nos pedidos semanais de Monday'
  })
  message: string;

  @ApiProperty({
    description: 'Número de pedidos criados',
    example: 5
  })
  ordersCreated: number;

  @ApiProperty({
    description: 'Dia da semana atual',
    example: 'Monday',
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  })
  currentDay: DayOfWeek;
} 