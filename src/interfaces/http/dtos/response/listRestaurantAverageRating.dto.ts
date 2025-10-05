import { ApiProperty } from '@nestjs/swagger';

export class ListRestaurantAverageRatingDtoResponse {
  @ApiProperty({ example: 1, description: 'ID da avaliação' })
  id: number;

  @ApiProperty({ example: 10, description: 'ID do restaurante' })
  restaurantId: number;

  @ApiProperty({ example: 1, description: 'ID do usuário' })
  userId: number;

  @ApiProperty({ example: 'João da Silva', description: 'Nome do funcionário' })
  employeeName: string;

  @ApiProperty({ example: 5, description: 'Nota da avaliação (1 a 5)' })
  rating: number;

  @ApiProperty({ example: 'Excelente atendimento e comida deliciosa!', description: 'Descrição da avaliação' })
  description: string;
} 