import { CreateDishService } from './create-dish.use-cases';

describe('CreateDishService', () => {
  it('delega create para o DishRepository', async () => {
    const created = { id: 1, name: 'Pizza', price: 30 };
    const repo = { create: jest.fn().mockResolvedValue(created) };
    const service = new CreateDishService(repo as any);

    const dish = { name: 'Pizza', price: 30 } as any;
    await expect(service.execute(dish)).resolves.toEqual(created);
    expect(repo.create).toHaveBeenCalledWith(dish);
  });
});
