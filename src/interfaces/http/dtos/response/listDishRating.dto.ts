import { DishRatingEntityInterface } from '../../../../domain/repositories/dish-rating.repository.interface';
import { ApiProperty } from '@nestjs/swagger';

export class DishRatingItemDto {
  @ApiProperty({
    description: 'Nome do usuário que avaliou',
    example: 'João da Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Nota da avaliação',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'URL da imagem de perfil do usuário',
    example: 'https://unsplash.com/pt-br/s/fotografias/profile',
  })
  profileImage: string;

  @ApiProperty({
    description: 'Descrição da avaliação',
    example: 'Prato muito bom',
  })
  description: string;
}

export class ListDishRatingDtoResponse {
  @ApiProperty({
    description: 'ID do prato',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID do restaurante',
    example: 1,
  })
  restaurantId: number;

  @ApiProperty({
    description: 'Nome do prato',
    example: 'Spaghetti Carbonara',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do prato',
    example: 'A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
  })
  description: string;

  @ApiProperty({
    description: 'Preço do prato',
    example: 12.99,
  })
  price: number;

  @ApiProperty({
    description: 'URL da imagem do prato',
    example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgvmB2VTV_c3jF2jr9TJqJlZunjoWldt_YA&s',
    required: false,
  })
  image?: string;

  @ApiProperty({
    description: 'Média de avaliações do prato',
    example: 4,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Quantidade de avaliações do prato',
    example: 2,
  })
  ratingCount: number;

  @ApiProperty({
    description: 'Avaliações do prato',
    type: [DishRatingItemDto],
    required: false,
  })
  ratings?: DishRatingItemDto[];
} 