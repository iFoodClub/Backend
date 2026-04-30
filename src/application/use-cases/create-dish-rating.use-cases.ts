import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DishRatingEntityInterface } from 'src/domain/repositories/dish-rating.repository.interface';
import { DishRatingRepository } from 'src/infrastructure/database/repositories/dish-rating.repository';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';

@Injectable()
export class CreateDishRatingService {
  constructor(
    @Inject('DISH_RATING_REPOSITORY')
    private readonly dishRatingRepository: DishRatingRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  async execute(
    dishRating: Omit<DishRatingEntityInterface, 'id'>,
  ): Promise<DishRatingEntityInterface> {
    const dish = await this.dishRepository.getById(dishRating.dishId);
    if (!dish) {
      throw new NotFoundException('Prato não encontrado');
    }
    return await this.dishRatingRepository.create(dishRating);
  }
}