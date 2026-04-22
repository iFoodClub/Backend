import { NotFoundException } from '@nestjs/common';
import { CreateOrUpdateWeeklyOrderService } from './create-or-update-weekly-order.use-cases';

describe('CreateOrUpdateWeeklyOrderService', () => {
  let weeklyRepo: any;
  let employeeRepo: any;
  let orderItemRepo: any;
  let service: CreateOrUpdateWeeklyOrderService;

  const input: any = {
    employeeId: 5,
    dayOfWeek: 'monday',
    order: { dishId: 20, quantity: 1 },
  };

  beforeEach(() => {
    weeklyRepo = {
      findByEmployeeAndDay: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    employeeRepo = { getById: jest.fn() };
    orderItemRepo = { create: jest.fn() };
    service = new CreateOrUpdateWeeklyOrderService(
      weeklyRepo,
      employeeRepo,
      orderItemRepo,
    );
  });

  it('lança NotFoundException quando o funcionário não existe', async () => {
    employeeRepo.getById.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('atualiza o pedido semanal existente', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    orderItemRepo.create.mockResolvedValue({ id: 77 });
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ id: 1 });
    weeklyRepo.update.mockResolvedValue({ id: 1, orderItemId: 77 });

    const result = await service.execute(input);

    expect(weeklyRepo.update).toHaveBeenCalledWith(1, {
      employeeId: 5,
      dayOfWeek: 'monday',
      orderItemId: 77,
    });
    expect(weeklyRepo.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 1, orderItemId: 77 });
  });

  it('lança NotFoundException quando a atualização falha', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    orderItemRepo.create.mockResolvedValue({ id: 77 });
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ id: 1 });
    weeklyRepo.update.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toMatchObject({
      message: expect.stringContaining('atualizar'),
    });
  });

  it('cria um novo pedido semanal quando não existe', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    orderItemRepo.create.mockResolvedValue({ id: 77 });
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue(null);
    weeklyRepo.create.mockResolvedValue({ id: 99 });

    const result = await service.execute(input);

    expect(weeklyRepo.create).toHaveBeenCalledWith({
      employeeId: 5,
      dayOfWeek: 'monday',
      orderItemId: 77,
    });
    expect(weeklyRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 99 });
  });

  it('lança NotFoundException quando a criação falha', async () => {
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    orderItemRepo.create.mockResolvedValue({ id: 77 });
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue(null);
    weeklyRepo.create.mockResolvedValue(null);

    await expect(service.execute(input)).rejects.toMatchObject({
      message: expect.stringContaining('criar'),
    });
  });
});
