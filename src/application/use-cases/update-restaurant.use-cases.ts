import { BadRequestException, Injectable } from '@nestjs/common';
import { RestaurantInterface } from '../../domain/models/restaurant.model';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';

@Injectable()
export class UpdateRestaurantService {
  constructor(
    private restaurantRepository: RestaurantRepository,
    private userRepository: UserRepository
  ) {}
  async execute(id: number, restaurantData: RestaurantInterface): Promise<RestaurantInterface> {
    if(restaurantData.profileImage){
      const user = await this.userRepository.updateImage(restaurantData.userId, {profileImage: restaurantData.profileImage});
      if(!user){
        throw new BadRequestException('Usuário não encontrado');
      }
    }
    const restaurant = await this.restaurantRepository.update(id, restaurantData);
    return {
      id: restaurant.id,
      userId: restaurant.userId,
      name: restaurant.name,
      cnpj: restaurant.cnpj,
      cep: restaurant.cep,
      rua: restaurant.rua,
      cidade: restaurant.cidade,
      estado: restaurant.estado,
      number: restaurant.number,
      complemento: restaurant.complemento,
      profileImage: restaurantData.profileImage
    }
  }
}