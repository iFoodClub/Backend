import { Inject, Injectable } from "@nestjs/common";
import { RestaurantRatingEntityInterface } from "src/domain/repositories/restaurant-rating.repository.interface";
import { RestaurantRatingRepository } from "src/infrastructure/database/repositories/restaurant-rating.repository";

@Injectable()
export class CreateRestaurantRatingService{
    constructor(
        @Inject('RESTAURANT_RATING_REPOSITORY')
        private readonly restaurantRatingRepository: RestaurantRatingRepository
    ) {}
    
    async execute(restaurantRating: Omit<RestaurantRatingEntityInterface,'id'>): Promise<RestaurantRatingEntityInterface> {
        return await this.restaurantRatingRepository.create(restaurantRating);
    }    
} 