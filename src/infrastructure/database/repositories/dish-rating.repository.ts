import { Inject, Injectable } from '@nestjs/common';
import { DishRatingEntity } from '../entities/dish-rating.entity';
import { DishRatingEntityInterface } from '../../../domain/repositories/dish-rating.repository.interface';

@Injectable()
export class DishRatingRepository {
  constructor(
    @Inject('DISH_RATING_ENTITY')
    private readonly dishRatingEntity: typeof DishRatingEntity,
  ) {}

  async create(rating: Omit<DishRatingEntityInterface, 'id'>): Promise<DishRatingEntityInterface> {
    return await this.dishRatingEntity.create(rating);
  }

  async getByDishAndUser(userId: number): Promise<DishRatingEntityInterface[] | null> {
    return await this.dishRatingEntity.findAll({ where: { userId } });
  }

  async update(
    id: number,
    ratingData: Partial<Omit<DishRatingEntityInterface, 'id'>>,
  ): Promise<DishRatingEntityInterface> {
    const rating = await this.dishRatingEntity.findByPk(id);
    return await rating.update(ratingData);
  }

  async listByDish(dishId: number): Promise<any[]> {
    const { UserEntity } = require('../entities/user.entity');
    const { EmployeeEntity } = require('../entities/employee.entity');
    return await this.dishRatingEntity.findAll({ 
      where: { dishId },
      include: [
        { model: UserEntity, as: 'user', include: [{ model: EmployeeEntity, as: 'employee' }] },
      ],
    });
  }

  async delete(id: number): Promise<void> {
    const rating = await this.dishRatingEntity.findByPk(id);
    await rating.destroy();
  }
}