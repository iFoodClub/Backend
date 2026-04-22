import { NotFoundException } from '@nestjs/common';
import { CreateIndividualOrderUseCase } from './create-indivisual-order.use-case';

describe('CreateIndividualOrderUseCase', () => {
  let companyOrderRepo: any;
  let individualOrderRepo: any;
  let companyRepo: any;
  let restaurantRepo: any;
  let employeeRepo: any;
  let dishRepo: any;
  let useCase: CreateIndividualOrderUseCase;

  const dto: any = {
    companyId: 1,
    restaurantId: 10,
    employeeId: 5,
    dishId: 20,
  };

  beforeEach(() => {
    companyOrderRepo = {};
    individualOrderRepo = { create: jest.fn() };
    companyRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    dishRepo = { getById: jest.fn() };

    useCase = new CreateIndividualOrderUseCase(
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

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFoundException quando o restaurante não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    restaurantRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança NotFoundException quando o funcionário não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toMatchObject({
      message: expect.stringContaining('Funcionário'),
    });
  });

  it('lança NotFoundException quando o prato não existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    dishRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toMatchObject({
      message: expect.stringContaining('Prato'),
    });
  });

  it('cria o pedido individual em status PREPARING quando tudo existe', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    restaurantRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.getById.mockResolvedValue({ id: 5 });
    dishRepo.getById.mockResolvedValue({ id: 20 });

    const result = await useCase.execute(dto);

    expect(individualOrderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 1,
        employeeId: 5,
        restaurantId: 10,
        dishId: 20,
        status: 'preparing',
      }),
    );
    expect(result).toEqual({ message: 'Pedido criado com sucesso' });
  });
});
