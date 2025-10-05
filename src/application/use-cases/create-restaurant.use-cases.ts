import { BadRequestException, Injectable } from "@nestjs/common";
import { RestaurantInterface } from "../../domain/models/restaurant.model";
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';

@Injectable()
export class CreateRestaurantService {
    constructor(private restaurantRepository: RestaurantRepository){}
    async execute(restaurant: RestaurantInterface): Promise<void> {
        const validate = await this.validateUserCreateRestaurant(restaurant);
        if(!validate){
            throw new BadRequestException('Já existe um restaurante cadastrado com este CNPJ');
        }
        this.restaurantRepository.create(restaurant);
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