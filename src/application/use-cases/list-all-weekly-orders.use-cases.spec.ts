import { ListAllWeeklyOrdersService } from './list-all-weekly-orders.use-cases';

describe('ListAllWeeklyOrdersService', () => {
  let weeklyRepo: any;
  let employeeRepo: any;
  let orderItemRepo: any;
  let dishRepo: any;
  let userRepo: any;
  let service: ListAllWeeklyOrdersService;

  beforeEach(() => {
    weeklyRepo = { findAll: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    orderItemRepo = { findByPk: jest.fn() };
    dishRepo = { getById: jest.fn() };
    userRepo = { getById: jest.fn() };
    service = new ListAllWeeklyOrdersService(
      weeklyRepo,
      employeeRepo,
      orderItemRepo,
      dishRepo,
      userRepo,
    );
  });

  it('retorna array vazio quando não há pedidos', async () => {
    weeklyRepo.findAll.mockResolvedValue([]);
    await expect(service.execute()).resolves.toEqual([]);
  });

  it('pula pedidos sem funcionário ou sem usuário', async () => {
    weeklyRepo.findAll.mockResolvedValue([
      { id: 1, employeeId: 10, dayOfWeek: 'Monday', orderItemId: null },
      { id: 2, employeeId: 11, dayOfWeek: 'Tuesday', orderItemId: null },
    ]);
    employeeRepo.getById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 11, userId: 99, name: 'Bob' });
    userRepo.getById.mockResolvedValue(null);

    const result = await service.execute();
    expect(result).toHaveLength(0);
  });

  it('mapeia pedidos completos com prato', async () => {
    weeklyRepo.findAll.mockResolvedValue([
      { id: 1, employeeId: 10, dayOfWeek: 'Monday', orderItemId: 100 },
    ]);
    employeeRepo.getById.mockResolvedValue({
      id: 10,
      userId: 50,
      name: 'Alice',
    });
    userRepo.getById.mockResolvedValue({ id: 50, email: 'alice@x.com' });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({
      id: 200,
      name: 'Pizza',
      price: 30,
      image: 'img',
      restaurantId: 7,
    });

    const result = await service.execute();
    expect(result).toEqual([
      expect.objectContaining({
        id: 1,
        employeeName: 'Alice',
        employeeEmail: 'alice@x.com',
        dish: expect.objectContaining({ id: 200, name: 'Pizza' }),
      }),
    ]);
  });

  it('retorna dish null quando orderItem sem dishId ou dish ausente', async () => {
    weeklyRepo.findAll.mockResolvedValue([
      { id: 1, employeeId: 10, dayOfWeek: 'Monday', orderItemId: 100 },
      { id: 2, employeeId: 10, dayOfWeek: 'Tuesday', orderItemId: 101 },
    ]);
    employeeRepo.getById.mockResolvedValue({
      id: 10,
      userId: 50,
      name: 'Alice',
    });
    userRepo.getById.mockResolvedValue({ id: 50, email: 'alice@x.com' });
    orderItemRepo.findByPk
      .mockResolvedValueOnce({ dishId: null })
      .mockResolvedValueOnce({ dishId: 300 });
    dishRepo.getById.mockResolvedValue(null);

    const result = await service.execute();
    expect(result.every((r) => r.dish === null)).toBe(true);
  });
});
