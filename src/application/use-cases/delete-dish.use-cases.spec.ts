import { DeleteDishService } from './delete-dish.use-cases';

describe('DeleteDishService', () => {
  it('delega o delete para o DishRepository', async () => {
    const dishRepository = { delete: jest.fn() };
    const service = new DeleteDishService(dishRepository as any);

    await service.execute(55);

    expect(dishRepository.delete).toHaveBeenCalledWith(55);
  });
});
