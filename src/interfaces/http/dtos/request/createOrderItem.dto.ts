import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderItemDto {
    @ApiProperty({
        description: 'ID do prato',
        type: Number,
        example: 1,
    })
    dishId: number;

    @ApiProperty({
        description: 'Quantidade',
        type: Number,
        example: 1,
    })
    quantity: number;
  }