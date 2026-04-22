import { NotFoundException } from '@nestjs/common';
import { SendOrdersUseCase } from './send-orders.use-case';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

describe('SendOrdersUseCase', () => {
  let repo: any;
  let useCase: SendOrdersUseCase;

  beforeEach(() => {
    repo = { getById: jest.fn(), updateStatus: jest.fn() };
    useCase = new SendOrdersUseCase(repo);
  });

  it('marca todos os pedidos informados como DELIVERED', async () => {
    repo.getById.mockResolvedValue({ id: 1 });

    await useCase.execute([1, 2, 3]);

    expect(repo.updateStatus).toHaveBeenCalledTimes(3);
    expect(repo.updateStatus).toHaveBeenCalledWith(1, CompanyOrderStatus.DELIVERED);
    expect(repo.updateStatus).toHaveBeenCalledWith(2, CompanyOrderStatus.DELIVERED);
    expect(repo.updateStatus).toHaveBeenCalledWith(3, CompanyOrderStatus.DELIVERED);
  });

  it('lança NotFoundException na primeira id inexistente', async () => {
    repo.getById
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);

    await expect(useCase.execute([1, 2])).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repo.updateStatus).toHaveBeenCalledTimes(1);
  });

  it('aceita lista vazia sem fazer nada', async () => {
    await expect(useCase.execute([])).resolves.toBeUndefined();
    expect(repo.getById).not.toHaveBeenCalled();
  });
});
