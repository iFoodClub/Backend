import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {
    @ApiProperty({ example: 'xqi2p0ihqpfmbiqr9hm' })
  accessToken: string;
}