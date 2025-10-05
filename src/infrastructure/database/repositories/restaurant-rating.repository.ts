import { Inject, Injectable } from '@nestjs/common';
import { RestaurantRatingEntity } from '../entities/restaurant-rating.entity';
import { RestaurantRatingEntityInterface } from '../../../domain/repositories/restaurant-rating.repository.interface';

@Injectable()
export class RestaurantRatingRepository {
  constructor(
    @Inject('RESTAURANT_RATING_ENTITY')
    private readonly restaurantRatingEntity: typeof RestaurantRatingEntity,
  ) {}

  async create(rating: Omit<RestaurantRatingEntityInterface, 'id'>): Promise<RestaurantRatingEntityInterface> {
    return await this.restaurantRatingEntity.create(rating);
  }

  async getByRestaurantAndUser(restaurantId: number, userId: number): Promise<RestaurantRatingEntityInterface | null> {
    return await this.restaurantRatingEntity.findOne({ where: { restaurantId, userId } });
  }

  async getByRestaurantId(restaurantId: number): Promise<RestaurantRatingEntityInterface[]> {
    return await this.restaurantRatingEntity.findAll({ where: { restaurantId } });
  }

  async getByUserId(userId: number): Promise<RestaurantRatingEntityInterface[]> {
    return await this.restaurantRatingEntity.findAll({ where: { userId } });
  }

  async update(
    id: number,
    ratingData: Partial<Omit<RestaurantRatingEntityInterface, 'id'>>,
  ): Promise<RestaurantRatingEntityInterface> {
    const rating = await this.restaurantRatingEntity.findByPk(id);
    return await rating.update(ratingData);
  }

  async listByRestaurant(restaurantId: number): Promise<RestaurantRatingEntityInterface[]> {
    const { UserEntity } = require('../entities/user.entity');
    return await this.restaurantRatingEntity.findAll({ 
      where: { restaurantId },
      include: [
        { model: UserEntity, as: 'user' },
      ],
    });
  }

  async delete(id: number): Promise<void> {
    const rating = await this.restaurantRatingEntity.findByPk(id);
    await rating.destroy();
  }
} 