import { EmployeeWeeklyOrdersRepository } from './employee-weekly-orders.repository';
import { DayOfWeek } from '../../../domain/repositories/employee-weekly-orders.repository.interface';

describe('EmployeeWeeklyOrdersRepository', () => {
  let entity: any;
  let repo: EmployeeWeeklyOrdersRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
    };
    repo = new EmployeeWeeklyOrdersRepository(entity);
  });

  it('create/getById/findAll delegam', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    entity.findByPk.mockResolvedValue({ id: 2 });
    entity.findAll.mockResolvedValue([{ id: 3 }]);

    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
    await expect(repo.getById(1)).resolves.toEqual({ id: 2 });
    await expect(repo.findAll()).resolves.toEqual([{ id: 3 }]);
  });

  it('update busca por pk e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { dayOfWeek: 'monday' } as any);
    expect(inst.update).toHaveBeenCalledWith({ dayOfWeek: 'monday' });
  });

  it('findByEmployeeAndDay usa findOne', async () => {
    await repo.findByEmployeeAndDay(1, 'monday' as DayOfWeek);
    expect(entity.findOne).toHaveBeenCalledWith({
      where: { employeeId: 1, dayOfWeek: 'monday' },
    });
  });

  it('findByEmployeeId usa findAll', async () => {
    await repo.findByEmployeeId(1);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { employeeId: 1 } });
  });

  it('delete usa destroy com where', async () => {
    await repo.delete(1);
    expect(entity.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
