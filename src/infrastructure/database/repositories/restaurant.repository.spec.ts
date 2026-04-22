import { RestaurantRepository } from './restaurant.repository';

describe('RestaurantRepository', () => {
  let entity: any;
  let repo: RestaurantRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    repo = new RestaurantRepository(entity);
  });

  it('create, getById, list delegam', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    entity.findByPk.mockResolvedValue({ id: 2 });
    entity.findAll.mockResolvedValue([{ id: 3 }]);

    await expect(repo.create({ name: 'X' } as any)).resolves.toEqual({ id: 1 });
    await expect(repo.getById(1)).resolves.toEqual({ id: 2 });
    await expect(repo.list()).resolves.toEqual([{ id: 3 }]);
  });

  it('update busca por pk e chama update na instância', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { name: 'X' } as any);
    expect(inst.update).toHaveBeenCalledWith({ name: 'X' });
  });

  it('delete chama destroy', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });

  it('findByCnpj/findByUserId/getByDishId montam where', async () => {
    await repo.findByCnpj('9');
    expect(entity.findOne).toHaveBeenCalledWith({ where: { cnpj: '9' } });
    await repo.findByUserId(7);
    expect(entity.findOne).toHaveBeenCalledWith({ where: { userId: 7 } });
    await repo.getByDishId(3);
    expect(entity.findOne).toHaveBeenCalledWith({ where: { dishId: 3 } });
  });
});
