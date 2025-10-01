import { Inject, Injectable } from "@nestjs/common";
import { DishRatingRepository } from "src/infrastructure/database/repositories/dish-rating.repository";

@Injectable()
export class DeleteDishRatingService {
    constructor(
        @Inject('DISH_RATING_REPOSITORY')
        private readonly dishRatingRepository: DishRatingRepository
    ) {}

    async execute(id: number): Promise<void> {
        await this.dishRatingRepository.delete(id);
    }
} 