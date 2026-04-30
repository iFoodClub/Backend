import { CompanyOrderRepository } from './company-order.repository';

describe('CompanyOrderRepository', () => {
  let entity: any;
  let repo: CompanyOrderRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    };
    repo = new CompanyOrderRepository(entity);
  });

  it('create delega', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('update busca e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { status: 'delivered' } as any);
    expect(inst.update).toHaveBeenCalledWith({ status: 'delivered' });
  });

  it('getById passa include collaboratorsOrders', async () => {
    entity.findByPk.mockResolvedValue({ id: 1 });
    await repo.getById(1);
    expect(entity.findByPk).toHaveBeenCalledWith(1, {
      include: ['collaboratorsOrders'],
    });
  });

  it('listByCompany / listByRestaurant usam findAll com where', async () => {
    await repo.listByCompany(5);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { companyId: 5 } });
    await repo.listByRestaurant(6);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { restaurantId: 6 },
    });
  });

  it('findOrdersHistoryByCompany monta where e includes', async () => {
    entity.findAll.mockResolvedValue([]);
    await repo.findOrdersHistoryByCompany(5);
    const arg = entity.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ companyId: 5 });
    expect(Array.isArray(arg.include)).toBe(true);
    expect(arg.order).toEqual([['id', 'DESC']]);
  });

  it('findOrdersByRestaurant monta where e includes', async () => {
    entity.findAll.mockResolvedValue([]);
    await repo.findOrdersByRestaurant(7);
    const arg = entity.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ restaurantId: 7 });
    expect(Array.isArray(arg.include)).toBe(true);
  });

  it('updateStatus busca e chama update com status', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.updateStatus(1, 'delivered');
    expect(inst.update).toHaveBeenCalledWith({ status: 'delivered' });
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });
});
