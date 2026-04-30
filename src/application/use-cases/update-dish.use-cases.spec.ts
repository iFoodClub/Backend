import { UpdateDishService } from './update-dish.use-cases';

describe('UpdateDishService', () => {
  it('delega update para o DishRepository e retorna o resultado', async () => {
    const updated = { id: 1, name: 'X', price: 10 };
    const repo = { update: jest.fn().mockResolvedValue(updated) };
    const service = new UpdateDishService(repo as any);

    await expect(service.execute(1, { name: 'X' } as any)).resolves.toEqual(
      updated,
    );
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'X' });
  });
});
