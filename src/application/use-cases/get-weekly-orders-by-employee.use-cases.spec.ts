import { NotFoundException } from '@nestjs/common';
import { GetWeeklyOrdersByEmployeeService } from './get-weekly-orders-by-employee.use-cases';

describe('GetWeeklyOrdersByEmployeeService', () => {
  let weeklyRepo: any;
  let employeeRepo: any;
  let orderItemRepo: any;
  let dishRepo: any;
  let service: GetWeeklyOrdersByEmployeeService;

  beforeEach(() => {
    weeklyRepo = { findByEmployeeId: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    orderItemRepo = { findByPk: jest.fn() };
    dishRepo = { getById: jest.fn() };
    service = new GetWeeklyOrdersByEmployeeService(
      weeklyRepo,
      employeeRepo,
      orderItemRepo,
      dishRepo,
    );
  });

  it('lança NotFound quando funcionário não existe', async () => {
    employeeRepo.getById.mockResolvedValue(null);
    await expect(service.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna 7 dias da semana mesmo sem pedidos', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 1 });
    weeklyRepo.findByEmployeeId.mockResolvedValue([]);
    const result = await service.execute(1);
    expect(result).toHaveLength(7);
    expect(result.every((d) => d.dish === null)).toBe(true);
  });

  it('mapeia pedido existente com prato', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 1 });
    weeklyRepo.findByEmployeeId.mockResolvedValue([
      {
        id: 10,
        employeeId: 1,
        dayOfWeek: 'Monday',
        orderItemId: 100,
      },
    ]);
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({
      id: 200,
      restaurantId: 5,
      name: 'X',
      description: 'desc',
      price: 10,
      image: 'i',
    });

    const result = await service.execute(1);
    const monday = result.find((d) => d.dayOfWeek === 'Monday');
    expect(monday?.dish?.id).toBe(200);
    expect(monday?.id).toBe(10);
  });

  it('lida com orderItem sem dishId e pedido sem orderItemId', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 1 });
    weeklyRepo.findByEmployeeId.mockResolvedValue([
      {
        id: 11,
        employeeId: 1,
        dayOfWeek: 'Tuesday',
        orderItemId: null,
      },
      {
        id: 12,
        employeeId: 1,
        dayOfWeek: 'Wednesday',
        orderItemId: 77,
      },
    ]);
    orderItemRepo.findByPk.mockResolvedValue({ dishId: null });

    const result = await service.execute(1);
    expect(result.find((d) => d.dayOfWeek === 'Tuesday')?.dish).toBeNull();
    expect(result.find((d) => d.dayOfWeek === 'Wednesday')?.dish).toBeNull();
  });
});
