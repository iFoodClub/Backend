import { DishRatingEntity } from "../database/entities/dish-rating.entity";
import { DishRatingRepository } from "../database/repositories/dish-rating.repository";

export const dishRatingProvider = [
  {
    provide: 'DISH_RATING_ENTITY',
    useValue: DishRatingEntity,
  },
  {
    provide: 'DISH_RATING_REPOSITORY',
    useClass: DishRatingRepository,
  },
];