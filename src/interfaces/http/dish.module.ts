import { Module } from '@nestjs/common';

import { DishController } from './controllers/dish.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { dishProvider } from 'src/infrastructure/providers/dish.provider';
import { dishRatingProvider } from 'src/infrastructure/providers/dish-rating.provider';
import { AverageRatingByRestaurantService } from 'src/application/use-cases/average-rating-by-restaurant.use-cases';
import { CreateDishService } from 'src/application/use-cases/create-dish.use-cases';
import { DeleteDishService } from 'src/application/use-cases/delete-dish.use-cases';
import { GetDishByIdService } from 'src/application/use-cases/get-dish-byid.use-cases';
import { ListDishesByRestaurantService } from 'src/application/use-cases/list-dishes-by-restaurant.use-cases';
import { ListDishesService } from 'src/application/use-cases/list-dishes.use-cases';
import { UpdateDishService } from 'src/application/use-cases/update-dish.use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [DishController],
  providers: [
    ...dishProvider,
    ...dishRatingProvider,
    ListDishesService, 
    GetDishByIdService, 
    CreateDishService, 
    UpdateDishService, 
    DeleteDishService,
    ListDishesByRestaurantService,
    AverageRatingByRestaurantService
  ],
  exports: [
    ListDishesService, 
    GetDishByIdService, 
    CreateDishService, 
    UpdateDishService, 
    DeleteDishService,
    ListDishesByRestaurantService,
    AverageRatingByRestaurantService
  ]
})
export class DishModule {}