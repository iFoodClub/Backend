import { DishRatingEntityInterface } from 'src/domain/repositories/dish-rating.repository.interface';
import { OrderItemEntityInterface } from 'src/domain/repositories/order-item.repository.interface';
import { DishRatingWithEmployeeEntityInterface } from '../repositories/dish-rating-with-employee.interface';

export interface DishInterface {
  id: number;
  restaurantName?: string;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  averageRating?: number;
  ratingCount?: number;
  ratings?: DishRatingEntityInterface[];
  orderItems?: OrderItemEntityInterface[];
}