import { Inject, Injectable } from "@nestjs/common";
import { DishRatingEntityInterface } from "src/domain/repositories/dish-rating.repository.interface";
import { DishRatingRepository } from "src/infrastructure/database/repositories/dish-rating.repository";
import { DishRepository } from "src/infrastructure/database/repositories/dish.repository";
import { EmployeeRepository } from "src/infrastructure/database/repositories/employee.repository";
import { RestaurantRepository } from "src/infrastructure/database/repositories/restaurant.repository";

@Injectable()
export class GetByDishAndUserService {
    constructor(
        @Inject('DISH_RATING_REPOSITORY')
        private readonly dishRatingRepository: DishRatingRepository,
        @Inject('DISH_REPOSITORY')
        private readonly dishRepository: DishRepository,
        @Inject('RESTAURANT_REPOSITORY')
        private readonly restaurantRepository: RestaurantRepository,
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository
    ) {}

    async execute(userId: number): Promise<DishRatingEntityInterface[]> {
        const dishRating = await this.dishRatingRepository.getByDishAndUser(userId)
        const dishName = await Promise.all(dishRating.map(async (r: DishRatingEntityInterface) => {
            const dish = await this.dishRepository.getById(r.dishId);
            return {id: dish.id, name: dish.name, restaurantId: dish.restaurantId};
        }));
        const restaurantName = await Promise.all(dishName.map(async (r: {id: number, name: string, restaurantId: number}) => {
            const restaurant = await this.restaurantRepository.getById(r.restaurantId);
            return  {id: restaurant.id, name: restaurant.name};
        }));
        const employeeName = await Promise.all(dishRating.map(async () => {
            const employee = await this.employeeRepository.getByUserId(userId);
            return employee.name;
        }));
        const dishRatingWithEmployeeName = dishRating.map((r: DishRatingEntityInterface, index: number) => ({
            id: r.id,
            rating: r.rating,
            description: r.description,
            dishId: r.dishId,
            dishName: dishName[index].name,
            restaurantId: restaurantName[index].id,
            restaurantName: restaurantName[index].name,
            userId: r.userId,
            employeeName: employeeName[index]
        }));
        return dishRatingWithEmployeeName;
    }
}