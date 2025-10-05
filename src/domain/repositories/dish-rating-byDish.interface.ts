import { DishRatingWithEmployeeEntityInterface } from "./dish-rating-with-employee.interface";

export interface DishRatingByDishEntityInterface {
    averageRating?: number;
    ratingCount?: number;
    ratings: DishRatingWithEmployeeEntityInterface[];
  }