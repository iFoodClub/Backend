import { Injectable } from '@nestjs/common';
import { RestaurantInterface } from '../../domain/models/restaurant.model';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { RestaurantRatingRepository } from 'src/infrastructure/database/repositories/restaurant-rating.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { use } from 'passport';

@Injectable()
export class ListRestaurantService {
  constructor(
    private restaurantRepository: RestaurantRepository,
    private restaurantRatingRepository: RestaurantRatingRepository,
    private userRepository: UserRepository
  ){}
  async execute(): Promise<RestaurantInterface[]> {
    const restaurants = await this.restaurantRepository.list();
    const restaurantRatings = await Promise.all(restaurants.map(async (restaurant: RestaurantInterface) => {
      const restaurantRatings = await this.restaurantRatingRepository.getByRestaurantId(restaurant.id);
      const averageRating = restaurantRatings.reduce((acc, rating) => acc + rating.rating, 0) / restaurantRatings.length;
      return {
        averageRating: averageRating
      };
      }));
    const restaurantsWithAverageRating = await Promise.all(restaurants.map(async (restaurant: RestaurantInterface, index: number) => {
      const user = await this.userRepository.getById(restaurant.userId);
      return {
      id: restaurant.id,
      name: restaurant.name,
      userId: restaurant.userId,
      cnpj: restaurant.cnpj,
      cep: restaurant.cep,
      number: restaurant.number,
      rua: restaurant.rua,
      cidade: restaurant.cidade,
      estado: restaurant.estado,
      complemento: restaurant.complemento,
      profileImage: user.profileImage,
      averageRating: restaurantRatings[index].averageRating,
    }}));

    return restaurantsWithAverageRating;
  }
}