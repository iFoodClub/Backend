import { IndividualOrderRepository } from './individual-order.repository';
import { IndividualOrderStatus } from '../../../domain/repositories/individual-order.repository.interface';

describe('IndividualOrderRepository', () => {
  let entity: any;
  let repo: IndividualOrderRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      update: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    };
    repo = new IndividualOrderRepository(entity);
  });

  it('create delega', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('update retorna o primeiro item do array do sequelize', async () => {
    entity.update.mockResolvedValue([3]);
    const r = await repo.update({ id: 1, status: 'preparing' } as any);
    expect(r).toBe(3);
    expect(entity.update).toHaveBeenCalledWith(
      { id: 1, status: 'preparing' },
      { where: { id: 1 } },
    );
  });

  it('getById delega para findByPk', async () => {
    entity.findByPk.mockResolvedValue({ id: 1 });
    await expect(repo.getById(1)).resolves.toEqual({ id: 1 });
  });

  it('listByCompanyOrder, listByCompanyOrderIdNull, listByEmployee usam findAll', async () => {
    await repo.listByCompanyOrder(1);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { companyOrderId: 1 },
    });
    await repo.listByCompanyOrderIdNull(2);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { companyOrderId: null, companyId: 2 },
    });
    await repo.listByEmployee(3);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { employeeId: 3 } });
  });

  it('listByCompanyOrderIdNullWithIncludes monta where e include', async () => {
    await repo.listByCompanyOrderIdNullWithIncludes(9);
    const arg = entity.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ companyOrderId: null, companyId: 9 });
    expect(Array.isArray(arg.include)).toBe(true);
    expect(arg.include.length).toBe(2);
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });

  it('updateStatus lança quando order não existe', async () => {
    entity.findByPk.mockResolvedValue(null);
    await expect(
      repo.updateStatus(1, IndividualOrderStatus.COMPLETED),
    ).rejects.toThrow();
  });

  it('updateStatus atualiza status quando order existe', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.updateStatus(1, IndividualOrderStatus.COMPLETED);
    expect(inst.update).toHaveBeenCalledWith({
      status: IndividualOrderStatus.COMPLETED,
    });
  });

  it('areAllOrdersCompleted é true quando não há orders PREPARING', async () => {
    entity.findAll.mockResolvedValue([]);
    await expect(repo.areAllOrdersCompleted(1)).resolves.toBe(true);
  });

  it('areAllOrdersCompleted é false quando há orders PREPARING', async () => {
    entity.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(repo.areAllOrdersCompleted(1)).resolves.toBe(false);
  });

  it('getCompletedOrdersCount usa count com status COMPLETED', async () => {
    entity.count.mockResolvedValue(3);
    await expect(repo.getCompletedOrdersCount(1)).resolves.toBe(3);
    expect(entity.count).toHaveBeenCalledWith({
      where: { companyOrderId: 1, status: IndividualOrderStatus.COMPLETED },
    });
  });

  it('getTotalOrdersCount usa count sem filtro de status', async () => {
    entity.count.mockResolvedValue(5);
    await expect(repo.getTotalOrdersCount(1)).resolves.toBe(5);
    expect(entity.count).toHaveBeenCalledWith({
      where: { companyOrderId: 1 },
    });
  });
});
