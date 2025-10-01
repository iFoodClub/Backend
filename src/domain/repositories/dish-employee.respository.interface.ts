import { OrderItemEntityInterface } from "./order-item.repository.interface";
import { DishRatingWithEmployeeEntityInterface } from "./dish-rating-with-employee.interface";

export interface DishEmployeeEntityInterface {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  averageRating?: number;
  ratingCount?: number;
  ratings?: DishRatingWithEmployeeEntityInterface[];
  orderItems?: OrderItemEntityInterface[];
}