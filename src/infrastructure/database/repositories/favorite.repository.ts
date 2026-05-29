import { Inject, Injectable } from '@nestjs/common';
import { FavoriteRestaurantEntity } from '../entities/favorite-restaurant.entity';
import { FavoriteRestaurantInterface } from 'src/domain/models/favorite-restaurant.model';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { DishEntity } from '../entities/dish.entity';
import { RestaurantRatingEntity } from '../entities/restaurant-rating.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FavoriteRepository {
  constructor(
    @Inject('FAVORITE_RESTAURANT_ENTITY')
    private readonly favoriteEntity: typeof FavoriteRestaurantEntity,
  ) {}

  async add(
    favorite: FavoriteRestaurantInterface,
  ): Promise<FavoriteRestaurantEntity> {
    return await this.favoriteEntity.create(favorite as any);
  }

  async remove(userId: number, restaurantId: number): Promise<void> {
    const favorite = await this.findByUserAndRestaurant(userId, restaurantId);
    if (favorite) {
      await favorite.destroy();
    }
  }

  async findByUserAndRestaurant(
    userId: number,
    restaurantId: number,
  ): Promise<FavoriteRestaurantEntity | null> {
    return await this.favoriteEntity.findOne({
      where: { userId, restaurantId },
    });
  }

  async listByUserId(userId: number): Promise<FavoriteRestaurantEntity[]> {
    return await this.favoriteEntity.findAll({
      where: { userId },
      include: [
        {
          model: RestaurantEntity,
          include: [
            { model: DishEntity },
            { model: RestaurantRatingEntity },
            { model: UserEntity },
          ],
        },
      ],
    });
  }
}
