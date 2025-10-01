import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantRatingDto {
  @ApiProperty({ example: 1, description: 'ID do restaurante' })
  restaurantId: number;

  @ApiProperty({ example: 1, description: 'ID do usuário' })
  userId: number;

  @ApiProperty({ example: 5, description: 'Nota da avaliação (1 a 5)' })
  rating: number;

  @ApiProperty({ example: 'Excelente atendimento e comida deliciosa!', description: 'Descrição da avaliação' })
  description: string;
} 