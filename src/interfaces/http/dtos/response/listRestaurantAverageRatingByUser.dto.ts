import { ApiProperty } from '@nestjs/swagger';

export class ListRestaurantAverageRatingByUserDtoResponse {
  @ApiProperty({ example: 1, description: 'ID da avaliação' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID do restaurante' })
  restaurantId: number;
  
    @ApiProperty({ example: 'Sabores do Chef', description: 'Nome do restaurante' })
    restaurantName: string;

  @ApiProperty({ example: 10, description: 'ID do usuário' })
  userId: number;

  @ApiProperty({ example: 5, description: 'Nota da avaliação (1 a 5)' })
  rating: number;

  @ApiProperty({ example: 'Excelente restaurante! Comida deliciosa e atendimento impecável. Recomendo muito!', description: 'Descrição da avaliação' })
  description: string;
} 