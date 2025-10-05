import { ApiProperty } from "@nestjs/swagger";

export class ListCompanyDtoResponse {
   @ApiProperty({
    description: 'ID da empresa',
    type: Number,   
    example: 1,
    })
    id: number;
    
    @ApiProperty({
    description: 'ID do usuário proprietário da empresa',
    type: Number,
    example: 1,
    })
    userId: number;
    
    @ApiProperty({
    description: 'Nome da empresa',
    type: String,
    example: 'Food Club',
    })
    name: string;

    @ApiProperty({
    description: 'CNPJ da empresa',
    type: String,
    example: '12.345.678/0001-90',
    })
    cnpj: string;

    @ApiProperty({
    description: 'CEP da empresa',
    type: String,
    example: '12345-678',
    })
    cep: string;

    @ApiProperty({
    description: 'Número do endereço da empresa',
    type: String,
    example: '123',
    })
    number: string;

    @ApiProperty({
    description: 'ID do restaurante associado à empresa',
    type: Number,
    example: 1,
    })
    restaurantId: number;
}