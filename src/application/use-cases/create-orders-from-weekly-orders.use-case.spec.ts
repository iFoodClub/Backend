import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrdersFromWeeklyOrdersUseCase } from './create-orders-from-weekly-orders.use-case';

describe('CreateOrdersFromWeeklyOrdersUseCase', () => {
  let companyRepo: any;
  let employeeRepo: any;
  let weeklyRepo: any;
  let individualRepo: any;
  let companyOrderRepo: any;
  let orderItemRepo: any;
  let dishRepo: any;
  let restaurantRepo: any;
  let validateTriggerTime: any;
  let useCase: CreateOrdersFromWeeklyOrdersUseCase;

  beforeEach(() => {
    companyRepo = { getById: jest.fn() };
    employeeRepo = { listByCompany: jest.fn() };
    weeklyRepo = { findByEmployeeAndDay: jest.fn() };
    individualRepo = {
      listByCompanyOrderIdNull: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    };
    companyOrderRepo = { create: jest.fn() };
    orderItemRepo = { findByPk: jest.fn() };
    dishRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn().mockResolvedValue(null) };
    validateTriggerTime = { execute: jest.fn() };

    useCase = new CreateOrdersFromWeeklyOrdersUseCase(
      companyRepo,
      employeeRepo,
      weeklyRepo,
      individualRepo,
      companyOrderRepo,
      orderItemRepo,
      dishRepo,
      restaurantRepo,
      validateTriggerTime,
    );
  });

  it('lança NotFound quando empresa não existe', async () => {
    companyRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFound quando não há funcionários', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    employeeRepo.listByCompany.mockResolvedValue([]);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança BadRequest quando já existem pedidos pendentes', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    individualRepo.listByCompanyOrderIdNull.mockResolvedValue([{ id: 99 }]);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('lança BadRequest quando nenhum pedido individual é criado', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 5 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('cria pedidos e atualiza com companyOrderId', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: null });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
    weeklyRepo.findByEmployeeAndDay
      .mockResolvedValueOnce({ orderItemId: 100 })
      .mockResolvedValueOnce({ orderItemId: null });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({ id: 200, restaurantId: 7 });
    individualRepo.create.mockResolvedValue({ id: 999 });
    companyOrderRepo.create.mockResolvedValue({ id: 555 });

    const result = await useCase.execute(1);

    expect(individualRepo.create).toHaveBeenCalledTimes(1);
    expect(companyOrderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 1, restaurantId: 7 }),
    );
    expect(individualRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 999, companyOrderId: 555 }),
    );
    expect(result.ordersCreated).toBe(1);
    expect(result.message).toContain('1 pedido');
  });

  it('usa restaurantId da empresa quando nenhum prato define', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 9 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ orderItemId: 100 });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({ id: 200, restaurantId: 9 });
    individualRepo.create.mockResolvedValue({ id: 999 });
    companyOrderRepo.create.mockResolvedValue({ id: 555 });

    const result = await useCase.execute(1);
    expect(result.ordersCreated).toBe(1);
  });

  it('US42: valida horário de funcionamento do restaurante antes de criar o pedido da empresa', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 9 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ orderItemId: 100 });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({ id: 200, restaurantId: 9 });
    individualRepo.create.mockResolvedValue({ id: 999 });
    companyOrderRepo.create.mockResolvedValue({ id: 555 });
    restaurantRepo.getById.mockResolvedValue({
      id: 9,
      name: 'Casa do Sabor',
      openingTime: '08:00',
      closingTime: '18:00',
    });

    await useCase.execute(1);

    expect(restaurantRepo.getById).toHaveBeenCalledWith(9);
    expect(validateTriggerTime.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        openingTime: '08:00',
        closingTime: '18:00',
        restaurantName: 'Casa do Sabor',
      }),
    );
  });

  it('US42: propaga BadRequest quando o disparo cai fora do horário do restaurante', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 9 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ orderItemId: 100 });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({ id: 200, restaurantId: 9 });
    individualRepo.create.mockResolvedValue({ id: 999 });
    restaurantRepo.getById.mockResolvedValue({
      id: 9,
      name: 'Casa do Sabor',
      openingTime: '08:00',
      closingTime: '18:00',
    });
    validateTriggerTime.execute.mockImplementation(() => {
      throw new BadRequestException('fora do horário');
    });

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(companyOrderRepo.create).not.toHaveBeenCalled();
  });

  it('US42: pula validação quando o restaurante não tem horários cadastrados', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 9 });
    employeeRepo.listByCompany.mockResolvedValue([{ id: 10 }]);
    weeklyRepo.findByEmployeeAndDay.mockResolvedValue({ orderItemId: 100 });
    orderItemRepo.findByPk.mockResolvedValue({ dishId: 200 });
    dishRepo.getById.mockResolvedValue({ id: 200, restaurantId: 9 });
    individualRepo.create.mockResolvedValue({ id: 999 });
    companyOrderRepo.create.mockResolvedValue({ id: 555 });
    restaurantRepo.getById.mockResolvedValue({
      id: 9,
      name: 'Sem Horário',
      openingTime: null,
      closingTime: null,
    });

    const result = await useCase.execute(1);

    expect(validateTriggerTime.execute).not.toHaveBeenCalled();
    expect(result.ordersCreated).toBe(1);
  });
});
