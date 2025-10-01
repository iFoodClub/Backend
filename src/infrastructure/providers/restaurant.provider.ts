import { RestaurantEntity } from "../database/entities/restaurant.entity";
import { RestaurantRepository } from '../database/repositories/restaurant.repository';

export const restaurantProvider = [
  {
    provide: 'RESTAURANT_ENTITY',
    useValue: RestaurantEntity,
  },
  {
    provide: 'RESTAURANT_REPOSITORY',
    useClass: RestaurantRepository,
  },
];