import { Inject, Injectable } from '@nestjs/common';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { DishRatingRepository } from 'src/infrastructure/database/repositories/dish-rating.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { DishEmployeeEntityInterface } from 'src/domain/repositories/dish-employee.respository.interface';

@Injectable()
export class ListDishesService {
  constructor(
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
    @Inject('DISH_RATING_REPOSITORY')
    private readonly dishRatingRepository: DishRatingRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository
  ) {}
  async execute(): Promise<DishEmployeeEntityInterface[]>{
    const dishes = await this.dishRepository.list(); 
    const dishesWithRatings = await Promise.all(dishes.map(async dish => {
      const ratings = await this.dishRatingRepository.listByDish(dish.id);
      const ratingCount = ratings.length;
      const averageRating = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
      const ratingsWithEmployeeName = await Promise.all(ratings.map(async r => {
        let employeeName = 'Usuário';
        if (r.userId) {
          const employee = await this.employeeRepository.findByUserId(r.userId);
          if (employee && employee.name) employeeName = employee.name;
        }
        return {
          id: r.id,
          name: employeeName,
          rating: r.rating,
          profileImage: r.user?.profileImage || null,
          description: r.description || null,
        };
      }));
      return {
        id: dish.id,
        restaurantId: dish.restaurantId,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        image: dish.image,
        averageRating: Number(averageRating.toFixed(2)),
        ratingCount: ratingCount,
        ratings: ratingsWithEmployeeName,
      };
    }));
    return dishesWithRatings;
  }
}
