import { DishRatingEntityInterface } from "./dish-rating.repository.interface";
import { OrderItemEntityInterface } from "./order-item.repository.interface";

export interface DishEntityInterface {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  ratings?: DishRatingEntityInterface[];
  orderItems?: OrderItemEntityInterface[];
}