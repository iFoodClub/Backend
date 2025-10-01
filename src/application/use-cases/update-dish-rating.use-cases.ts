import { Inject, Injectable } from "@nestjs/common";
import { DishRatingEntityInterface } from "src/domain/repositories/dish-rating.repository.interface";
import { DishRatingRepository } from "src/infrastructure/database/repositories/dish-rating.repository";

@Injectable()
export class UpdateDishRatingService {
    constructor(
        @Inject('DISH_RATING_REPOSITORY')
        private readonly dishRatingRepository: DishRatingRepository
    ) {}

    async execute(id: number, ratingData: Partial<Omit<DishRatingEntityInterface, 'id'>>): Promise<DishRatingEntityInterface> {
        return await this.dishRatingRepository.update(id, ratingData);
    }
} 