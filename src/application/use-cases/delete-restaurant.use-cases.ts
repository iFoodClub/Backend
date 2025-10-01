import { Injectable } from '@nestjs/common';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';

@Injectable()
export class DeleteRestaurantService {
  constructor(private restaurantRepository: RestaurantRepository) {}
  execute(id: number): void {
    this.restaurantRepository.delete(id);
  }
}