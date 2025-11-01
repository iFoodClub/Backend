import { ApiProperty } from '@nestjs/swagger';
import { IEmployeeWithWeeklyOrders, IWeeklyOrder, IDRestaurant, IDEmployee, IDDish } from 'src/domain/models/weekly-orders-populated.model';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export class IDRestaurantDto implements IDRestaurant {
  @ApiProperty({
    description: 'ID do restaurante',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome do restaurante',
    example: 'Restaurante XYZ'
  })
  name: string;

  @ApiProperty({
    description: 'Imagem de perfil do restaurante',
    example: 'https://example.com/profile.jpg'
  })
  profileImage: string;
}

export class IDEmployeeDto implements IDEmployee {
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
    description: 'Imagem de perfil do funcionário',
    example: 'https://example.com/profile.jpg'
  })
  profileImage: string;
}

export class IDDishDto implements IDDish {
  @ApiProperty({
    description: 'ID do prato',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Nome do prato',
    example: 'Spaghetti Carbonara'
  })
  name: string;

  @ApiProperty({
    description: 'Preço do prato',
    example: 25.99,
    type: Number
  })
  price: number;

  @ApiProperty({
    description: 'Imagem do prato',
    example: 'https://example.com/dish.jpg'
  })
  image: string;
}

export class IWeeklyOrderDto implements IWeeklyOrder {
  @ApiProperty({
    description: 'ID do pedido semanal',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Informações do funcionário',
    type: IDEmployeeDto
  })
  employee: IDEmployee;

  @ApiProperty({
    description: 'Informações do prato',
    type: IDDishDto
  })
  order: IDDish;
}

export class EmployeeWithWeeklyOrdersDto implements IEmployeeWithWeeklyOrders {
  @ApiProperty({
    description: 'ID do funcionário',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Dia da semana',
    example: 'Monday'
  })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Informações do restaurante',
    type: IDRestaurantDto
  })
  restaurant: IDRestaurant;

  @ApiProperty({
    description: 'Pedidos semanais do funcionário',
    type: [IWeeklyOrderDto],
    isArray: true
  })
  weeklyOrders: IWeeklyOrder[];
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
    type: [EmployeeWithWeeklyOrdersDto],
    isArray: true
  })
  employees: EmployeeWithWeeklyOrdersDto[];
} 