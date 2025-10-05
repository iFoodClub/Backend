import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";

export class RestaurantDetailDishDto {
    @ApiProperty({
        type: 'number',
        description: 'ID do prato',
        example: 1,
    })
    id: number;

    @ApiProperty({
        type: 'number',
        description: 'ID do restaurante',
        example: 1,
    })
    restaurantId: number;

    @ApiProperty({
        type: 'string',
        description: 'Nome do prato',
        example: 'Spaghetti Carbonara',
    })
    name: string;

    @ApiProperty({
        type: 'string',
        description: 'Descrição do prato',
        example: 'A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
    })
    description: string;

    @ApiProperty({
        type: 'number',
        description: 'Preço do prato',
        example: 12.99,
    })
    price: number;

    @ApiProperty({
        type: 'string',
        description: 'URL da imagem do prato',
        example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgvmB2VTV_c3jF2jr9TJqJlZunjoWldt_YA&s',
        nullable: true,
    })
    image?: string;
}

export class RestaurantDetailRatingDto {
    @ApiProperty({
        type: 'number',
        description: 'ID da avaliação',
        example: 1,
    })
    id: number;

    @ApiProperty({
        type: 'number',
        description: 'ID do restaurante',
        example: 1,
    })
    restaurantId: number;

    @ApiProperty({
        type: 'number',
        description: 'ID do usuário que fez a avaliação',
        example: 10,
    })
    userId: number;

    @ApiProperty({
        type: 'string',
        description: 'Nome do funcionário que fez a avaliação',
        example: 'João da Silva',
    })
    employeeName: string;

    @ApiProperty({
        type: 'number',
        description: 'Nota da avaliação (1-5)',
        example: 5,
    })
    rating: number;

    @ApiProperty({
        type: 'string',
        description: 'Descrição da avaliação',
        example: 'Excelente restaurante! Comida deliciosa e atendimento impecável. Recomendo muito!',
    })
    description: string;
}

@ApiExtraModels(RestaurantDetailDishDto, RestaurantDetailRatingDto)
export class RestaurantDetailDtoResponse {
    @ApiProperty({
        type: 'number',
        description: 'ID do restaurante',
        example: 1,
    })
    id: number;

    @ApiProperty({
        type: 'number',
        description: 'ID do usuário do restaurante',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        type: 'string',
        description: 'Nome do restaurante',
        example: 'Sabores do Chef',
    })
    name: string;

    @ApiProperty({
        type: 'string',
        description: 'CNPJ do restaurante',
        example: '12.345.678/0001-90',
    })
    cnpj: string;

    @ApiProperty({
        type: 'string',
        description: 'CEP do restaurante',
        example: '12345-678',
    })
    cep: string;

    @ApiProperty({
        type: 'string',
        description: 'Rua do restaurante',
        example: 'Rua das Flores',
    })
    rua: string;

    @ApiProperty({
        type: 'string',
        description: 'Cidade do restaurante',
        example: 'São Paulo',
    })
    cidade: string;

    @ApiProperty({
        type: 'string',
        description: 'Estado do restaurante (sigla)',
        example: 'SP',
    })
    estado: string;

    @ApiProperty({
        type: 'string',
        description: 'Número do restaurante',
        example: '123',
    })
    number: string;

    @ApiProperty({
        type: 'string',
        description: 'Complemento do endereço',
        example: 'Sala 101',
    })
    complemento: string;

    @ApiProperty({
        type: 'string',
        description: 'URL da imagem do restaurante',
        example: 'https://www.tripadvisor.com.br/Restaurant_Review-g303235-d12083289-Reviews-Sabores_do_Chef_Picanharia-Manaus_Amazon_River_State_of_Amazonas.html',
    })
    profileImage: string;

    @ApiProperty({
        type: 'array',
        items: { $ref: '#/components/schemas/RestaurantDetailDishDto' },
        description: 'Lista de pratos do restaurante (máximo 1 prato)',
        maxItems: 1,
    })
    dishes: RestaurantDetailDishDto[];

    @ApiProperty({
        type: 'array',
        items: { $ref: '#/components/schemas/RestaurantDetailRatingDto' },
        description: 'Lista de avaliações do restaurante (máximo 1 avaliação)',
        maxItems: 1,
    })
    restaurantRatings: RestaurantDetailRatingDto[];

    @ApiProperty({
        type: 'number',
        description: 'Avaliação média do restaurante',
        example: 4.5,
    })
    averageRating: number;
} 