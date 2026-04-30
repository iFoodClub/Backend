import { UpdateDishRatingService } from './update-dish-rating.use-cases';

describe('UpdateDishRatingService', () => {
  it('delega update para o DishRatingRepository', async () => {
    const updated = { id: 1, rating: 5 };
    const repo = { update: jest.fn().mockResolvedValue(updated) };
    const service = new UpdateDishRatingService(repo as any);

    await expect(service.execute(1, { rating: 5 })).resolves.toEqual(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { rating: 5 });
  });
});
