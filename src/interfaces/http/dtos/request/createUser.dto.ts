import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "src/domain/repositories/user.repository.interface";

export class CreateUserDto {
    @ApiProperty({
        description: 'Tipo de usuário (employee, restaurant, company)',
        type: UserType,
        example: 'employee',
        enum: UserType,
        enumName: 'UserType',
    })
    userType: UserType;

    @ApiProperty({
        type: 'string',
        description: 'Nome do usuário',
        example: 'João da Silva',
    })
    name: string;

    @ApiProperty({
        type: 'string',
        description: 'Email do usuário',
        example: 'joao.silva@email.com',
    })
    email: string;

    @ApiProperty({
        type: 'string',
        description: 'Senha do usuário',
        example: 'senha123',
    })
    password: string;

    @ApiProperty({
        description: 'CPF do usuário (obrigatório para employee)',
        type: String,
        example: '12345678901',
        required: false,
    })
    cpf?: string;

    @ApiProperty({
        description: 'CNPJ do usuário (obrigatório para restaurant e company)',
        type: String,
        example: '98765432000188',
        required: false,
    })
    cnpj?: string;

    @ApiProperty({
        description: 'Dados específicos do funcionário (obrigatório quando userType = employee)',
        type: 'object',
        example: {
            name: "João da Silva",
            birthDate: "1990-05-10"
        },
        required: false,
    })
    employee?: {
        name: string;
        birthDate: string;
    };

    @ApiProperty({
        description: 'Dados específicos do restaurante (obrigatório quando userType = restaurant)',
        type: 'object',
        example: {
            name: "Restaurante Saboroso",
            cep: "87654321",
            number: "200"
        },
        required: false,
    })
    restaurant?: {
        name: string;
        cep: string;
        number: string;
    };

    @ApiProperty({
        description: 'Dados específicos da empresa (obrigatório quando userType = company)',
        type: 'object',
        example: {
            name: "Empresa ABC Ltda",
            cep: "12345678",
            number: "100"
        },
        required: false,
    })
    company?: {
        name: string;
        cep: string;
        number: string;
    };
}