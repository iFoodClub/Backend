import { UserEntityInterface } from "./user.repository.interface";

export interface RestaurantRatingEntityInterface {
  id: number;
  restaurantId: number;
  userId: number;
  rating: number;
  description: string;
  user?: UserEntityInterface;
} 