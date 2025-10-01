import { Inject, Injectable } from "@nestjs/common";
import { RestaurantRatingEntityInterface } from "src/domain/repositories/restaurant-rating.repository.interface";
import { RestaurantRatingRepository } from "src/infrastructure/database/repositories/restaurant-rating.repository";
import { UserRepository } from "src/infrastructure/database/repositories/user.repository";
import { EmployeeRepository } from "src/infrastructure/database/repositories/employee.repository";

@Injectable()
export class GetListByRestaurantService{
    constructor(
        @Inject('RESTAURANT_RATING_REPOSITORY')
        private readonly restaurantRatingRepository: RestaurantRatingRepository,
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository,
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository
    ) {}

    async execute(restaurantId: number):Promise<RestaurantRatingEntityInterface[]> {
        const restaurantRating = await this.restaurantRatingRepository.listByRestaurant(restaurantId);
        const result: RestaurantRatingEntityInterface[] = [];
        for (const rating of restaurantRating) {
            const user = await this.userRepository.getById(rating.userId);
            rating.user = user;
        }

        const restaurantRatingWithEmployeeName = await Promise.all(restaurantRating.map(async (rating: RestaurantRatingEntityInterface) => {
            const employee = await this.employeeRepository.getByUserId(rating.userId);
            return {
                id: rating.id,
                restaurantId: rating.restaurantId,
                userId: rating.userId,
                employeeName: employee.name,
                rating: rating.rating,
                description: rating.description,
            }
        }))

        return restaurantRatingWithEmployeeName.map(rating => ({
            id: rating.id,
            restaurantId: rating.restaurantId,
            userId: rating.userId,
            employeeName: rating.employeeName,
            rating: rating.rating,
            description: rating.description,
        }));
    }
} 