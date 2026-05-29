import { Injectable } from '@nestjs/common';
import { FavoriteRepository } from 'src/infrastructure/database/repositories/favorite.repository';

@Injectable()
export class ListFavoritesUseCase {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async execute(userId: number) {
    try {
      const favorites = await this.favoriteRepository.listByUserId(userId);
      if (!favorites || !Array.isArray(favorites)) return [];

      return favorites
        .filter((f) => f && f.restaurant) // Garante que o favorito e o restaurante associado existam
        .map((f) => {
          const restaurant = f.restaurant;
          const dishes = restaurant.dishes || [];
          const ratings = restaurant.restaurantRatings || [];

          const averageRating =
            ratings.length > 0
              ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
              : 4.5; // Fallback se não houver avaliações

          const minPrice =
            dishes.length > 0 ? Math.min(...dishes.map((d) => d.price)) : 0;

          const dishCount = dishes.length;

          return {
            id: restaurant.id,
            name: restaurant.name,
            userId: restaurant.userId,
            cnpj: restaurant.cnpj,
            cep: restaurant.cep,
            rua: restaurant.rua,
            cidade: restaurant.cidade,
            estado: restaurant.estado,
            number: restaurant.number,
            complemento: restaurant.complemento,
            openingTime: restaurant.openingTime,
            closingTime: restaurant.closingTime,
            // Usando o campo 'image' do restaurante ou fallback para o usuário
            profileImage: restaurant.image || restaurant.user?.profileImage,
            averageRating: averageRating,
            minPrice: minPrice,
            dishCount: dishCount,
          };
        });
    } catch (error) {
      console.error('Erro ao buscar favoritos no UseCase:', error);
      return []; // Retorna lista vazia caso ocorra qualquer erro no banco ou mapeamento
    }
  }
}
