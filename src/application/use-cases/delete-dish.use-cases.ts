import { Inject, Injectable } from '@nestjs/common';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';

@Injectable()
export class DeleteDishService {
  constructor(
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository
  ) {}
  async execute(id: number): Promise<void> {
    this.dishRepository.delete(id);
  }
}