import { Inject, Injectable } from "@nestjs/common";
import { RestaurantRatingEntityInterface } from "src/domain/repositories/restaurant-rating.repository.interface";
import { RestaurantRatingRepository } from "src/infrastructure/database/repositories/restaurant-rating.repository";

@Injectable()
export class UpdateRestaurantRatingService {
    constructor(
        @Inject('RESTAURANT_RATING_REPOSITORY')
        private readonly restaurantRatingRepository: RestaurantRatingRepository
    ) {}

    async execute(id: number, ratingData: Partial<Omit<RestaurantRatingEntityInterface, 'id'>>): Promise<RestaurantRatingEntityInterface> {
        return await this.restaurantRatingRepository.update(id, ratingData);
    }
} 