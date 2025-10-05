import { ApiProperty } from "@nestjs/swagger";
import { DishInterface } from "src/domain/models/dish.model";

export class CreateRestaurantDto {
    @ApiProperty({
        description: 'ID do usuário que está criando o restaurante',
        type: Number,
        example: 1,
    })
    userId: number;

    @ApiProperty({
        description: 'Nome do restaurante',
        type: String,
        example: 'Sabores do Chef',
    })
    name: string;

    @ApiProperty({
        description: 'CNPJ do restaurante',
        type: String,
        example: '12.345.678/0001-90',
    })
    cnpj: string;

    @ApiProperty({
        description: 'CEP do restaurante',
        type: String,
        example: '12345-678',
    })
    cep: string;

    @ApiProperty({
        description: 'Rua do restaurante',
        type: String,
        example: 'Rua das Flores',
    })
    rua: string;

    @ApiProperty({
        description: 'Cidade do restaurante',
        type: String,
        example: 'São Paulo',
    })
    cidade: string;

    @ApiProperty({
        description: 'Estado do restaurante (sigla)',
        type: String,
        example: 'SP',
    })
    estado: string;

    @ApiProperty({
        description: 'Número do restaurante',
        type: String,
        example: '123',
    })
    number: string;

    @ApiProperty({
        description: 'Complemento do endereço',
        type: String,
        example: 'Sala 101',
        required: false,
    })
    complemento?: string;

    @ApiProperty({
        description: 'URL da imagem do restaurante',
        type: String,
        example: 'https://www.tripadvisor.com.br/Restaurant_Review-g303235-d12083289-Reviews-Sabores_do_Chef_Picanharia-Manaus_Amazon_River_State_of_Amazonas.html',
        required: false,
    })
    profileImage?: string;
}