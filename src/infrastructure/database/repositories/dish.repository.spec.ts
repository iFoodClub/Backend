import { DishRepository } from './dish.repository';

describe('DishRepository', () => {
  let entity: any;
  let repo: DishRepository;

  beforeEach(() => {
    entity = {
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    };
    repo = new DishRepository(entity);
  });

  it('list, create, getById, listByRestaurant delegam', async () => {
    entity.findAll.mockResolvedValue([{ id: 1 }]);
    entity.create.mockResolvedValue({ id: 2 });
    entity.findByPk.mockResolvedValue({ id: 3 });

    await expect(repo.list()).resolves.toEqual([{ id: 1 }]);
    await expect(repo.create({} as any)).resolves.toEqual({ id: 2 });
    await expect(repo.getById(3)).resolves.toEqual({ id: 3 });
    await repo.listByRestaurant(5);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { restaurantId: 5 } });
  });

  it('update busca e atualiza', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { name: 'X' } as any);
    expect(inst.update).toHaveBeenCalledWith({ name: 'X' });
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });
});
