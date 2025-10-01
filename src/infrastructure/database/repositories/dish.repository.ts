import { Inject, Injectable } from '@nestjs/common';
import { DishEntity } from '../entities/dish.entity';
import { DishEntityInterface } from '../../../domain/repositories/dish.repository.interface';

@Injectable()
export class DishRepository {
  constructor(
    @Inject('DISH_ENTITY')
    private readonly dishEntity: typeof DishEntity,
  ) {}

  async list(): Promise<DishEntityInterface[]> {
    return await this.dishEntity.findAll({
    });
  }
  async create(dish: Omit<DishEntityInterface, 'id'>): Promise<DishEntityInterface> {
    return await this.dishEntity.create(dish);
  }

  async update(
    id: number,
    dishData: Partial<Omit<DishEntityInterface, 'id'>>,
  ): Promise<DishEntityInterface> {
    const dish = await this.dishEntity.findByPk(id);
    return await dish.update(dishData);
  }

  async getById(id: number): Promise<DishEntityInterface | null> {
    return await this.dishEntity.findByPk(id, {
    });
  }

  async listByRestaurant(restaurantId: number): Promise<DishEntityInterface[]> {
    return await this.dishEntity.findAll({ where: { restaurantId } });
  }

  async delete(id: number): Promise<void> {
    const dish = await this.dishEntity.findByPk(id);
    await dish.destroy();
  }
}