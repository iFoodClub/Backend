import { ApiProperty } from "@nestjs/swagger";
import { CompanyAffiliateRestaurantEntityInterface } from "src/domain/repositories/company-affiliate-restaurant.repository.interface";
import { EmployeeEntityInterface } from "src/domain/repositories/employee.repository.interface";

export class CreateCompanyDto {    
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

    @ApiProperty({
    description: 'Imagem de perfil da empresa',
    type: String,
    example: 'https://example.com/profile.jpg',
    })
    profileImage: string;
    }