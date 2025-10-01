import { DishEntity } from "../database/entities/dish.entity";
import { DishRepository } from '../database/repositories/dish.repository';

export const dishProvider = [
  {
    provide: 'DISH_ENTITY',
    useValue: DishEntity,
  },
  {
    provide: 'DISH_REPOSITORY',
    useClass: DishRepository,
  },
];