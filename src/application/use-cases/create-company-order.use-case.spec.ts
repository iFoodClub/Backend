import { NotFoundException } from '@nestjs/common';
import { CreateCompanyOrderUseCase } from './create-company-order.use-case';

describe('CreateCompanyOrderUseCase', () => {
  let companyOrderRepo: any;
  let individualOrderRepo: any;
  let companyRepo: any;
  let restaurantRepo: any;
  let employeeRepo: any;
  let dishRepo: any;
  let useCase: CreateCompanyOrderUseCase;

  const individualOrders = [
    {
      id: 1,
      companyId: 1,
      restaurantId: 10,
      employeeId: 5,
      dishId: 20,
    },
  ];

  beforeEach(() => {
    companyOrderRepo = { create: jest.fn() };
    individualOrderRepo = {
      listByCompanyOrderIdNull: jest.fn(),
      update: jest.fn(),
    };
    companyRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    dishRepo = { getById: jest.fn() };

    useCase = new CreateCompanyOrderUseCase(
      companyOrderRepo,
      individualOrderRepo,
      companyRepo,
      restaurantRepo,
      employeeRepo,
      dishRepo,
    );
  });

  it('lança NotFoundException quando a empresa não existe', async () => {
    companyRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFoundException quando não há pedidos individuais pendentes', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    individualOrderRepo.listByCompanyOrderIdNull.mockResolvedValue([]);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFoundException quando o restaurante não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    individualOrderRepo.listByCompanyOrderIdNull.mockResolvedValue(individualOrders);
    restaurantRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFoundException quando um funcionário não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    individualOrderRepo.listByCompanyOrderIdNull.mockResolvedValue(individualOrders);
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toMatchObject({
      message: expect.stringContaining('Funcionário'),
    });
  });

  it('lança NotFoundException quando um prato não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    individualOrderRepo.listByCompanyOrderIdNull.mockResolvedValue(individualOrders);
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    dishRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toMatchObject({
      message: expect.stringContaining('Prato'),
    });
  });

  it('cria company order e atualiza cada pedido individual como PREPARING', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    individualOrderRepo.listByCompanyOrderIdNull.mockResolvedValue(individualOrders);
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    dishRepo.getById.mockResolvedValue({ id: 20 });
    companyOrderRepo.create.mockResolvedValue({ id: 999 });

    const result = await useCase.execute(1);

    expect(companyOrderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 1,
        restaurantId: 10,
        status: 'created',
      }),
    );
    expect(individualOrderRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        companyOrderId: 999,
        status: 'preparing',
      }),
    );
    expect(result).toEqual({ id: 999, message: 'Pedido criado com sucesso' });
  });
});
