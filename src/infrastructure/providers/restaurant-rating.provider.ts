import { RestaurantRatingEntity } from "../database/entities/restaurant-rating.entity";
import { RestaurantRatingRepository } from "../database/repositories/restaurant-rating.repository";

export const restaurantRatingProvider = [
  {
    provide: 'RESTAURANT_RATING_ENTITY',
    useValue: RestaurantRatingEntity,
  },
  {
    provide: 'RESTAURANT_RATING_REPOSITORY',
    useClass: RestaurantRatingRepository,
  },
]; 