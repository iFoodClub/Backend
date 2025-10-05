import { ApiProperty } from "@nestjs/swagger";

export class ListEmployeeDtoResponse {
    @ApiProperty({
        description: 'ID do funcionário',
        type: Number,
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'ID do usuário',
        type: Number,
        example: 10,
    })
    userId: number;

    @ApiProperty({
        description: 'ID da empresa',
        type: Number,
        example: 1,
    })
    companyId: number;

    @ApiProperty({
        description: 'Nome do funcionário',
        type: String,
        example: 'João da Silva',
    })
    name: string;

    @ApiProperty({
        description: 'CPF do funcionário',
        type: String,
        example: '123.456.789-00',
    })
    cpf: string;

    @ApiProperty({
        description: 'Data de nascimento do funcionário',
        type: String,
        example: '1990-01-01',
    })
    birthDate: string;

    @ApiProperty({
        description: 'Status de férias do funcionário',
        type: Boolean,
        example: false,
    })
    vacation: boolean;
}