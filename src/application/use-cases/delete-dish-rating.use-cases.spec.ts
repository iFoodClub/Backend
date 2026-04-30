import { DeleteDishRatingService } from './delete-dish-rating.use-cases';

describe('DeleteDishRatingService', () => {
  it('delega o delete para o DishRatingRepository', async () => {
    const dishRatingRepository = { delete: jest.fn().mockResolvedValue(undefined) };
    const service = new DeleteDishRatingService(dishRatingRepository as any);

    await service.execute(12);

    expect(dishRatingRepository.delete).toHaveBeenCalledWith(12);
  });
});
