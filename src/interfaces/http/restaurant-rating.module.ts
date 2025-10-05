import { Module } from '@nestjs/common';
import { RestaurantRatingController } from './controllers/restaurant-rating.controller';
import { restaurantRatingProvider } from '../../infrastructure/providers/restaurant-rating.provider';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { RestaurantRatingRepository } from 'src/infrastructure/database/repositories/restaurant-rating.repository';
import { CreateRestaurantRatingService } from 'src/application/use-cases/create-restaurant-rating.use-cases';
import { DeleteRestaurantRatingService } from 'src/application/use-cases/delete-restaurant-rating.use-cases';
import { GetByRestaurantAndUserService } from 'src/application/use-cases/get-byrestaurant-and-user.use-cases';
import { GetListByRestaurantService } from 'src/application/use-cases/list-byrestaurant.use-cases';
import { UpdateRestaurantRatingService } from 'src/application/use-cases/update-restaurant-rating.use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [RestaurantRatingController],
  providers: [
    ...restaurantRatingProvider,
    CreateRestaurantRatingService,
    GetListByRestaurantService,
    GetByRestaurantAndUserService,
    UpdateRestaurantRatingService,
    DeleteRestaurantRatingService,
    RestaurantRatingRepository, 
  ],
  exports: [
    CreateRestaurantRatingService,
    GetListByRestaurantService,
    GetByRestaurantAndUserService,
    UpdateRestaurantRatingService,
    DeleteRestaurantRatingService,
    RestaurantRatingRepository, 
  ],
})
export class RestaurantRatingModule {} 