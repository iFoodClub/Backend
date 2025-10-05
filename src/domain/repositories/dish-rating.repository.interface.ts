export interface DishRatingEntityInterface {
  id: number;
  dishId: number;
  userId: number;
  rating: number;
  description?: string;
}