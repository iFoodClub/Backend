import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { favoriteProvider } from 'src/infrastructure/providers/favorite.provider';
import { FavoriteRepository } from 'src/infrastructure/database/repositories/favorite.repository';
import { ToggleFavoriteUseCase } from 'src/application/use-cases/toggle-favorite.use-case';
import { ListFavoritesUseCase } from 'src/application/use-cases/list-favorites.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [
    ...favoriteProvider,
    FavoriteRepository,
    ToggleFavoriteUseCase,
    ListFavoritesUseCase,
  ],
  exports: [FavoriteRepository, ToggleFavoriteUseCase, ListFavoritesUseCase],
})
export class FavoriteModule {}
