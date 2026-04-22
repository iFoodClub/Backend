import { OrderItemRepository } from './order-item.repository';

describe('OrderItemRepository', () => {
  let entity: any;
  let repo: OrderItemRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
    };
    repo = new OrderItemRepository(entity);
  });

  it('create, findByPk, listByOrder delegam', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    entity.findByPk.mockResolvedValue({ id: 2 });
    entity.findAll.mockResolvedValue([{ id: 3 }]);

    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
    await expect(repo.findByPk(2)).resolves.toEqual({ id: 2 });
    await repo.listByOrder(5);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { individualOrderId: 5 },
    });
  });

  it('update busca e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { quantity: 2 } as any);
    expect(inst.update).toHaveBeenCalledWith({ quantity: 2 });
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });

  it('deleteByOrder chama destroy do model com where', async () => {
    await repo.deleteByOrder(5);
    expect(entity.destroy).toHaveBeenCalledWith({
      where: { individualOrderId: 5 },
    });
  });
});
