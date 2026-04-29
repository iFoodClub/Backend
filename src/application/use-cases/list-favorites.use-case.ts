import { Injectable } from '@nestjs/common';
import { FavoriteRepository } from 'src/infrastructure/database/repositories/favorite.repository';

@Injectable()
export class ListFavoritesUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(userId: number) {
    const favorites = await this.favoriteRepository.listByUserId(userId);
    return favorites.map(f => f.restaurant);
  }
}
