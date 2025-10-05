import { Inject, Injectable } from "@nestjs/common";
import { DishRatingByDishEntityInterface } from "src/domain/repositories/dish-rating-byDish.interface";
import { DishRatingRepository } from "src/infrastructure/database/repositories/dish-rating.repository";
import { EmployeeRepository } from "src/infrastructure/database/repositories/employee.repository";

@Injectable()
export class GetListByDishService{
    constructor(
        @Inject('DISH_RATING_REPOSITORY')
        private readonly dishRatingRepository: DishRatingRepository,
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository
    ) {}

    async execute(dishId: number):Promise<DishRatingByDishEntityInterface> {
        const dishRating = await this.dishRatingRepository.listByDish(dishId);
        const ratingsWithEmployeeName = await Promise.all(dishRating.map(async r => {
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
          const ratingCount = ratingsWithEmployeeName.length;
          const averageRating = ratingCount > 0 ? ratingsWithEmployeeName.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
        return {
            ratings: ratingsWithEmployeeName,
            averageRating: averageRating,
            ratingCount: ratingCount
        };
    }
}