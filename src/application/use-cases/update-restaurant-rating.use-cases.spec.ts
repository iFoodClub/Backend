import { UpdateRestaurantRatingService } from './update-restaurant-rating.use-cases';

describe('UpdateRestaurantRatingService', () => {
  it('delega update para o RestaurantRatingRepository', async () => {
    const updated = { id: 1, rating: 3 };
    const repo = { update: jest.fn().mockResolvedValue(updated) };
    const service = new UpdateRestaurantRatingService(repo as any);

    await expect(service.execute(1, { rating: 3 })).resolves.toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { rating: 3 });
  });
});
