import { ApiProperty } from '@nestjs/swagger';

export class DishRatingItemDto {
  @ApiProperty({
    description: 'ID da avaliação',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do usuário que fez a avaliação',
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

export class DishRatingSummaryDtoResponse {
  @ApiProperty({
    description: 'Lista de avaliações do prato',
    type: [DishRatingItemDto],
  })
  ratings: DishRatingItemDto[];

  @ApiProperty({
    description: 'Média das avaliações',
    example: 5,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Quantidade total de avaliações',
    example: 1,
  })
  ratingCount: number;
} 