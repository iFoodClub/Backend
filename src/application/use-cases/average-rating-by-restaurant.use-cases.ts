import { Inject, Injectable } from '@nestjs/common';
import { DishInterface } from '../../domain/models/dish.model';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { DishRatingRepository } from '../../infrastructure/database/repositories/dish-rating.repository';
import { AverageRatingDishInterface } from '../../domain/models/average-rating-dish.model';

@Injectable()
export class AverageRatingByRestaurantService {
  constructor(
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
    @Inject('DISH_RATING_REPOSITORY')
    private readonly dishRatingRepository: DishRatingRepository
  ) {}

  async execute(restaurantId: number): Promise<AverageRatingDishInterface[]> {
    const dishes = await this.dishRepository.listByRestaurant(restaurantId);
    const dishesWithAverage = await Promise.all(
      dishes.map(async (dish) => {
        const ratings = await this.dishRatingRepository.listByDish(dish.id);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;
        return {
          id: dish.id,
          name: dish.name,
          restaurantId: dish.restaurantId,
          price: dish.price,
          averageRating,
        };
      })
    );
    return dishesWithAverage;
  }
} 