import { ApiProperty } from '@nestjs/swagger';
import { EmployeeWeeklyOrderResponse } from './employeeWeeklyOrder.dto';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export class EmployeeWithWeeklyOrders {
  @ApiProperty({
    description: 'ID do funcionário',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome do funcionário',
    example: 'João Silva'
  })
  name: string;

  @ApiProperty({
    description: 'Pedidos semanais do funcionário',
    type: [EmployeeWeeklyOrderResponse],
    isArray: true
  })
  weeklyOrders: EmployeeWeeklyOrderResponse[];
}

export class CompanyWeeklyOrdersResponse {
  @ApiProperty({
    description: 'Informações da empresa',
    example: {
      id: 1,
      name: 'Empresa ABC'
    }
  })
  company: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'Dia da semana atual',
    example: 'Monday',
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  })
  currentDay: DayOfWeek;

  @ApiProperty({
    description: 'Lista de funcionários com seus pedidos semanais',
    type: [EmployeeWithWeeklyOrders],
    isArray: true
  })
  employees: EmployeeWithWeeklyOrders[];
} 