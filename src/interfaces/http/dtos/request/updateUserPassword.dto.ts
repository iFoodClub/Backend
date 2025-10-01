import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserPasswordDto {
    @ApiProperty({
        description: 'Senha do usuário',
        type: String,
        example: 'password123',
    })
    password: string;
}