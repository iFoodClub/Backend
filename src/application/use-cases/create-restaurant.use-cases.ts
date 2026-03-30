import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { RestaurantInterface } from "../../domain/models/restaurant.model";
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { UserType } from 'src/domain/repositories/user.repository.interface';
import { UserProfileEligibilityService } from './user-profile-eligibility.service';

@Injectable()
export class CreateRestaurantService {
    constructor(
        @Inject('RESTAURANT_REPOSITORY')
        private readonly restaurantRepository: RestaurantRepository,
        private readonly userProfileEligibilityService: UserProfileEligibilityService,
    ) {}

    async execute(restaurant: RestaurantInterface): Promise<void> {
        await this.userProfileEligibilityService.assertEligibleForProfile(
            restaurant.userId,
            UserType.RESTAURANT,
        );

        const validate = await this.validateUserCreateRestaurant(restaurant);
        if(!validate){
            throw new BadRequestException('Já existe um restaurante cadastrado com este CNPJ');
        }
        await this.restaurantRepository.create(restaurant);
    }
    
    async validateUserCreateRestaurant(restaurant: RestaurantInterface): Promise<boolean> {
        const restaurants = await this.restaurantRepository.list();
            const existingRestaurant = restaurants.find(r => r.cnpj === restaurant.cnpj);
            if(existingRestaurant){
                return false;
            }
            return true;
    }
}
