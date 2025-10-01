import { ApiProperty } from "@nestjs/swagger";

export class ListDishRatingUserResponse {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Imagem de perfil do usuário',
    example: 'https://exemplo.com/imagem.jpg',
  })
  profileImage: string;

  @ApiProperty({
    description: 'Avaliação do usuário',
    example: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Comentário do usuário',
    example: 'Muito bom!',
  })
  description: string;
}