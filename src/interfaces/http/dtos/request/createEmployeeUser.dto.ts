import { ApiProperty } from "@nestjs/swagger";

export class CreateEmployeeUserDto {
    @ApiProperty({
        description: 'Tipo de usuário (deve ser "employee")',
        example: 'employee',
        enum: ['employee'],
    })
    userType: 'employee';

    @ApiProperty({
        type: 'string',
        description: 'Nome do funcionário',
        example: 'João da Silva',
    })
    name: string;

    @ApiProperty({
        type: 'string',
        description: 'Email do funcionário',
        example: 'joao.silva@email.com',
    })
    email: string;

    @ApiProperty({
        type: 'string',
        description: 'Senha do funcionário',
        example: 'senha123',
    })
    password: string;

    @ApiProperty({
        description: 'CPF do funcionário',
        type: String,
        example: '12345678901',
    })
    cpf: string;

    @ApiProperty({
        description: 'Dados específicos do funcionário',
        type: 'object',
        example: {
            name: "João da Silva",
            birthDate: "1990-05-10"
        },
    })
    employee: {
        name: string;
        birthDate: string;
    };

    @ApiProperty({
        description: 'Dados da empresa associada',
        type: 'object',
        example: {
            id: 1
        },
    })
    company: {
        id: number;
    };
} 