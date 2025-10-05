import { ApiProperty } from "@nestjs/swagger";
import { DishInterface } from "src/domain/models/dish.model";
import { RestaurantRatingInterface } from "src/domain/models/restaurant-rating.model";

export class ListRestaurantDtoResponse {
    @ApiProperty({
    type: 'number',
    description: 'ID do restaurante',
    example: 1,
    })
    id: number;

    @ApiProperty({
        type: 'string',
        description: 'Nome do restaurante',
        example: 'Sabores do Chef',
    })
    name: string;

    @ApiProperty({
        type: 'number',
        description: 'ID do usuário do restaurante',
        example: 1,
    })
    userId: number;

    @ApiProperty({
        type: 'string',
        description: 'CNPJ do restaurante',
        example: '12.345.678/0001-90',
    })
    cnpj?: string;

    @ApiProperty({
        type: 'string',
        description: 'CEP do restaurante',
        example: '12345-678',
    })
    cep?: string;

    @ApiProperty({
        type: 'string',
        description: 'Rua do restaurante',
        example: 'Rua das Flores',
    })
    rua?: string;

    @ApiProperty({
        type: 'string',
        description: 'Cidade do restaurante',
        example: 'São Paulo',
    })
    cidade?: string;

    @ApiProperty({
        type: 'string',
        description: 'Estado do restaurante (sigla)',
        example: 'SP',
    })
    estado?: string;

    @ApiProperty({
        type: 'string',
        description: 'Número do restaurante',
        example: '123',
    })
    number?: string;

    @ApiProperty({
        type: 'string',
        description: 'Complemento do endereço',
        example: 'Sala 101',
    })
    complemento?: string;

    @ApiProperty({
        type: 'string',
        description: 'URL da imagem do restaurante',
        example: 'https://www.tripadvisor.com.br/Restaurant_Review-g303235-d12083289-Reviews-Sabores_do_Chef_Picanharia-Manaus_Amazon_River_State_of_Amazonas.html',
    })
    profileImage?: string;

    @ApiProperty({
        type: 'number',
        description: 'Avaliação média do restaurante',
        example: 4.5,
    })
    averageRating?: number;


}