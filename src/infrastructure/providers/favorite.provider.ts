import { FavoriteRestaurantEntity } from '../database/entities/favorite-restaurant.entity';

export const favoriteProvider = [
  {
    provide: 'FAVORITE_RESTAURANT_ENTITY',
    useValue: FavoriteRestaurantEntity,
  },
];
