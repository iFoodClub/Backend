import { ApiProperty } from '@nestjs/swagger';

export class CreateDishRatingDto {
  @ApiProperty({ example: 1, description: 'ID do prato' })
  dishId: number;

  @ApiProperty({ example: 10, description: 'ID do usuário' })
  userId: number;

  @ApiProperty({ example: 5, description: 'Nota da avaliação (1 a 5)' })
  rating: number;

  @ApiProperty({ example: 'Prato muito bom', description: 'Descrição da avaliação' })
  description: string;
} 