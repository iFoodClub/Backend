import { Inject, Injectable } from "@nestjs/common";
import { RestaurantRatingEntityInterface } from "src/domain/repositories/restaurant-rating.repository.interface";
import { RestaurantRatingRepository } from "src/infrastructure/database/repositories/restaurant-rating.repository";
import { RestaurantRepository } from "src/infrastructure/database/repositories/restaurant.repository";

@Injectable()
export class GetByRestaurantAndUserService {
    constructor(
        @Inject('RESTAURANT_RATING_REPOSITORY')
        private readonly restaurantRatingRepository: RestaurantRatingRepository,
        @Inject('RESTAURANT_REPOSITORY')
        private readonly restaurantRepository: RestaurantRepository
    ) {}

    async execute(userId: number): Promise<RestaurantRatingEntityInterface[]> {
        const restaurantRating = await this.restaurantRatingRepository.getByUserId(userId);
        
        const restaurantRatingWithRestaurantName = await Promise.all(restaurantRating.map(async (rating: RestaurantRatingEntityInterface) => {
            const restaurant = await this.restaurantRepository.getById(rating.restaurantId);
            return {
                id: rating.id,
                restaurantId: rating.restaurantId,
                restaurantName: restaurant.name,
                userId: rating.userId,
                rating: rating.rating,
                description: rating.description,
            }
        }))

        return restaurantRatingWithRestaurantName.map(rating => ({
            id: rating.id,
            restaurantId: rating.restaurantId,
            restaurantName: rating.restaurantName,
            userId: rating.userId,
            rating: rating.rating,
            description: rating.description,
        }));
    }
} 