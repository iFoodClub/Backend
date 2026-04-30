import { DeleteRestaurantRatingService } from './delete-restaurant-rating.use-cases';

describe('DeleteRestaurantRatingService', () => {
  it('delega o delete para o RestaurantRatingRepository', async () => {
    const restaurantRatingRepository = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const service = new DeleteRestaurantRatingService(
      restaurantRatingRepository as any,
    );

    await service.execute(4);

    expect(restaurantRatingRepository.delete).toHaveBeenCalledWith(4);
  });
});
