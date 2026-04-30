import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantRatingEntityInterface } from 'src/domain/repositories/restaurant-rating.repository.interface';
import { RestaurantRatingRepository } from 'src/infrastructure/database/repositories/restaurant-rating.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';

@Injectable()
export class CreateRestaurantRatingService {
  constructor(
    @Inject('RESTAURANT_RATING_REPOSITORY')
    private readonly restaurantRatingRepository: RestaurantRatingRepository,
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(
    restaurantRating: Omit<RestaurantRatingEntityInterface, 'id'>,
  ): Promise<RestaurantRatingEntityInterface> {
    const restaurant = await this.restaurantRepository.getById(
      restaurantRating.restaurantId,
    );
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }
    return await this.restaurantRatingRepository.create(restaurantRating);
  }
}
