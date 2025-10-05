import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyUserDto {
    @ApiProperty({
        description: 'Tipo de usuário (deve ser "company")',
        example: 'company',
        enum: ['company'],
    })
    userType: 'company';

    @ApiProperty({
        type: 'string',
        description: 'Nome da empresa',
        example: 'Empresa ABC Ltda',
    })
    name: string;

    @ApiProperty({
        type: 'string',
        description: 'Email da empresa',
        example: 'empresa@email.com',
    })
    email: string;

    @ApiProperty({
        type: 'string',
        description: 'Senha da empresa',
        example: 'senha123',
    })
    password: string;

    @ApiProperty({
        description: 'CNPJ da empresa',
        type: String,
        example: '12345678000199',
    })
    cnpj: string;

    @ApiProperty({
        description: 'Dados específicos da empresa',
        type: 'object',
        example: {
            name: "Empresa ABC Ltda",
            cep: "12345678",
            number: "100",
            restaurantId: null
        },
    })
    company: {
        name: string;
        cep: string;
        number: string;
        restaurantId?: number | null;
    };
} 