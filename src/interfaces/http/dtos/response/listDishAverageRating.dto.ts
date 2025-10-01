import { ApiProperty } from '@nestjs/swagger';

export class ListDishAverageRatingDtoResponse {
  @ApiProperty({
    description: 'ID da avaliação',
    example: 4,
  })
  id: number;

  @ApiProperty({
    description: 'Nota da avaliação',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Descrição da avaliação',
    example: 'Melhores tacos que já comi',
  })
  description: string;

  @ApiProperty({
    description: 'ID do prato',
    example: 6,
  })
  dishId: number;

  @ApiProperty({
    description: 'Nome do prato',
    example: 'Tacos al Pastor',
  })
  dishName: string;

  @ApiProperty({
    description: 'ID do restaurante',
    example: 3,
  })
  restaurantId: number;

  @ApiProperty({
    description: 'Nome do restaurante',
    example: 'Cantina Mexicana',
  })
  restaurantName: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: 13,
  })
  userId: number;

  @ApiProperty({
    description: 'Nome do funcionário',
    example: 'Ana Costa',
  })
  employeeName: string;
} 