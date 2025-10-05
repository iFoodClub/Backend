import { ApiProperty } from "@nestjs/swagger";

export class CreateEmployeeDto {
    @ApiProperty({
        description: 'ID do usuário associado ao funcionário',
        example: 10,
    })
    userId: number;

    @ApiProperty({
        description: 'ID da empresa associada ao funcionário',
        example: 1,
    })
    companyId: number;

    @ApiProperty({
        description: 'Nome do funcionário',
        example: 'João da Silva',
    })
    name: string;

    @ApiProperty({
        description: 'CPF do funcionário',
        example: '123.456.789-00',
    })
    cpf: string;

    @ApiProperty({
        description: 'Data de nascimento do funcionário',
        example: '1990-01-01',
        type: String,
    })
    birthDate: Date;

    @ApiProperty({
        description: 'Status de férias do funcionário',
        example: false,
        type: Boolean,
    })
    vacation: boolean;

    @ApiProperty({
        description: 'Imagem de perfil do funcionário',
        example: 'https://example.com/profile.jpg',
    })
    profileImage: string;
}