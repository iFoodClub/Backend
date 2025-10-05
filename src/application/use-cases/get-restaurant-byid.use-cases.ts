import { Inject, Injectable } from '@nestjs/common';
import { RestaurantInterface } from '../../domain/models/restaurant.model';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';
import { RestaurantRatingRepository } from 'src/infrastructure/database/repositories/restaurant-rating.repository';
import { RestaurantRatingInterface } from 'src/domain/models/restaurant-rating.model';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';

@Injectable()
export class GetRestaurantByIdService {
  constructor(
    private restaurantRepository: RestaurantRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
    @Inject('RESTAURANT_RATING_REPOSITORY')
    private readonly restaurantRatingRepository: RestaurantRatingRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository
  ){}
  async execute(id: number): Promise<RestaurantInterface> {
    const restaurant = await this.restaurantRepository.getById(id);
    const dishes = await this.dishRepository.listByRestaurant(id)
    const restaurantRatings = await this.restaurantRatingRepository.listByRestaurant(id).then(ratings => {
      return ratings.map(rating => ({
        id: rating.id,
        restaurantId: rating.restaurantId,
        userId: rating.userId,
        rating: rating.rating,
        description: rating.description
      }))
    })
    const restaurantRatingsWithEmployeeName = await Promise.all(restaurantRatings.map(async (rating: RestaurantRatingInterface) => {
      const employee = await this.employeeRepository.getByUserId(rating.userId)
      return {
        id: rating.id,
        restaurantId: rating.restaurantId,
        userId: rating.userId,
        employeeName: employee.name,
        rating: rating.rating,
        description: rating.description,
      }
    }))
    
    const averageRating = restaurantRatings.length > 0 ? restaurantRatings.reduce((sum, rating) => sum + rating.rating, 0) / restaurantRatings.length : 0
    const user = await this.userRepository.getById(restaurant.userId)
    const restaurantWithDishes = {
      id: restaurant.id,
      userId: restaurant.userId,
      name: restaurant.name,
      cnpj: restaurant.cnpj,
      cep: restaurant.cep,
      number: restaurant.number,
      rua: restaurant.rua,
      cidade: restaurant.cidade,
      estado: restaurant.estado,
      complemento: restaurant.complemento,
      profileImage: user.profileImage,
      dishes: dishes,
      restaurantRatings: restaurantRatingsWithEmployeeName,
      averageRating: averageRating
    }
    return restaurantWithDishes;
  }
}
