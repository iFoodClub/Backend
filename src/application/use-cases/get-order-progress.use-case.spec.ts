import { NotFoundException } from '@nestjs/common';
import { GetOrderProgressUseCase } from './get-order-progress.use-case';

describe('GetOrderProgressUseCase', () => {
  let companyOrderRepo: any;
  let individualOrderRepo: any;
  let useCase: GetOrderProgressUseCase;

  beforeEach(() => {
    companyOrderRepo = { getById: jest.fn() };
    individualOrderRepo = {
      getTotalOrdersCount: jest.fn(),
      getCompletedOrdersCount: jest.fn(),
      areAllOrdersCompleted: jest.fn(),
    };
    useCase = new GetOrderProgressUseCase(companyOrderRepo, individualOrderRepo);
  });

  it('lança NotFoundException quando o pedido não existe', async () => {
    companyOrderRepo.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna progresso calculado com percentual arredondado', async () => {
    companyOrderRepo.getById.mockResolvedValue({ id: 1, status: 'preparing' });
    individualOrderRepo.getTotalOrdersCount.mockResolvedValue(4);
    individualOrderRepo.getCompletedOrdersCount.mockResolvedValue(1);
    individualOrderRepo.areAllOrdersCompleted.mockResolvedValue(false);

    const result = await useCase.execute(1);

    expect(result).toEqual({
      companyOrderId: 1,
      companyOrderStatus: 'Preparando',
      totalOrders: 4,
      completedOrders: 1,
      progressPercentage: 25,
      isAllCompleted: false,
    });
  });

  it('retorna 0% quando não há pedidos individuais', async () => {
    companyOrderRepo.getById.mockResolvedValue({ id: 1, status: 'pending' });
    individualOrderRepo.getTotalOrdersCount.mockResolvedValue(0);
    individualOrderRepo.getCompletedOrdersCount.mockResolvedValue(0);
    individualOrderRepo.areAllOrdersCompleted.mockResolvedValue(false);

    const result = await useCase.execute(1);

    expect(result.progressPercentage).toBe(0);
    expect(result.companyOrderStatus).toBe('Enviado');
  });

  it('usa status padrão "Enviado" quando o status no banco não é mapeado', async () => {
    companyOrderRepo.getById.mockResolvedValue({ id: 1, status: 'unknown' });
    individualOrderRepo.getTotalOrdersCount.mockResolvedValue(2);
    individualOrderRepo.getCompletedOrdersCount.mockResolvedValue(2);
    individualOrderRepo.areAllOrdersCompleted.mockResolvedValue(true);

    const result = await useCase.execute(1);

    expect(result.companyOrderStatus).toBe('Enviado');
    expect(result.isAllCompleted).toBe(true);
    expect(result.progressPercentage).toBe(100);
  });
});
