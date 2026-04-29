import { ForbiddenException, Injectable } from '@nestjs/common';
import { FavoriteRepository } from 'src/infrastructure/database/repositories/favorite.repository';
import { UserType } from 'src/domain/models/user.model';

@Injectable()
export class ToggleFavoriteUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(userId: number, restaurantId: number, userType: UserType): Promise<{ favorited: boolean }> {
    if (userType !== UserType.COMPANY) {
      throw new ForbiddenException('Apenas empresas podem favoritar restaurantes.');
    }

    const existing = await this.favoriteRepository.findByUserAndRestaurant(userId, restaurantId);

    if (existing) {
      await this.favoriteRepository.remove(userId, restaurantId);
      return { favorited: false };
    } else {
      await this.favoriteRepository.add({ userId, restaurantId });
      return { favorited: true };
    }
  }
}
