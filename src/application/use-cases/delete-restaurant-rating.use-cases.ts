import { Inject, Injectable } from "@nestjs/common";
import { RestaurantRatingRepository } from "src/infrastructure/database/repositories/restaurant-rating.repository";

@Injectable()
export class DeleteRestaurantRatingService {
    constructor(
        @Inject('RESTAURANT_RATING_REPOSITORY')
        private readonly restaurantRatingRepository: RestaurantRatingRepository
    ) {}

    async execute(id: number): Promise<void> {
        await this.restaurantRatingRepository.delete(id);
    }
} 