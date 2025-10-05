import { ApiProperty } from "@nestjs/swagger";

export class CreateDishDto {
  @ApiProperty({
    description: 'ID of the restaurant to which the dish belongs',
    type: Number,
    example: 1,
  })
  restaurantId: number;

  @ApiProperty({
    description: 'Name of the dish',
    type: String,
    example: 'Spaghetti Carbonara',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the dish',
    type: String,
    example: 'A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
  })
  description: string;

  @ApiProperty({
    description: 'Price of the dish',
    type: Number,
    example: 12.99,
  })
  price: number;

  @ApiProperty({
    description: 'Image of the dish',
    type: String,
    example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgvmB2VTV_c3jF2jr9TJqJlZunjoWldt_YA&s',
  })
  image: string;
}