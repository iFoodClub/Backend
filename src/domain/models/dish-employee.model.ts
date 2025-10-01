import { OrderItemEntityInterface } from "src/domain/repositories/order-item.repository.interface";
import { DishRatingWithEmployeeEntityInterface } from "src/domain/repositories/dish-rating-with-employee.interface";

export interface DishEmployeeEntityInterface {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  ratings?: DishRatingWithEmployeeEntityInterface[];
  orderItems?: OrderItemEntityInterface[];
}