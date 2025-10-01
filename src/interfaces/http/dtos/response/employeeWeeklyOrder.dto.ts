import { ApiProperty } from "@nestjs/swagger";
import { DayOfWeek } from "src/domain/repositories/employee-weekly-orders.repository.interface";
import { OrderItemEntityInterface } from "src/domain/repositories/order-item.repository.interface";

export class EmployeeWeeklyOrderResponse {
    @ApiProperty({
        description: 'ID do pedido semanal',
        type: Number,
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'ID do funcionário',
        type: Number,
        example: 1,
    })
    employeeId: number;

    @ApiProperty({
        description: 'Dia da semana',
        type: String,
        example: 'Monday',
    })
    dayOfWeek: DayOfWeek;

    @ApiProperty({
        description: 'ID do item do pedido',
        type: Number,
        example: 1,
    })
    orderItemId: number;

    createdAt?: Date;
    updatedAt?: Date;

    @ApiProperty({
        description: 'Informações do pedido (order)',
        type: Object,
        example: { id: 1, dishId: 1, quantity: 1 },
        required: false,
    })
    order?: OrderItemEntityInterface;

    @ApiProperty({
        description: 'Informações do prato',
        type: Object,
        example: {
            id: 1,
            restaurantId: 1,
            name: "Spaghetti Carbonara",
            description: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
            price: 12.99,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLgvmB2VTV_c3jF2jr9TJqJlZunjoWldt_YA&s"
        },
        required: false,
    })
    dish?: {
        id: number;
        restaurantId: number;
        name: string;
        description: string;
        price: number;
        image: string;
    };
  } 