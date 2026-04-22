import { NotFoundException } from '@nestjs/common';
import { UpdateCompanyOrderStatusUseCase } from './update-company-order-status.use-case';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

describe('UpdateCompanyOrderStatusUseCase', () => {
  let repo: any;
  let useCase: UpdateCompanyOrderStatusUseCase;

  beforeEach(() => {
    repo = { getById: jest.fn(), updateStatus: jest.fn() };
    useCase = new UpdateCompanyOrderStatusUseCase(repo);
  });

  it('atualiza o status quando o pedido existe', async () => {
    repo.getById.mockResolvedValue({ id: 1 });

    const result = await useCase.execute(1, CompanyOrderStatus.DELIVERED);

    expect(repo.updateStatus).toHaveBeenCalledWith(1, CompanyOrderStatus.DELIVERED);
    expect(result.message).toContain('atualizado');
  });

  it('lança NotFoundException quando o pedido não existe', async () => {
    repo.getById.mockResolvedValue(null);

    await expect(
      useCase.execute(99, CompanyOrderStatus.DELIVERED),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });
});
