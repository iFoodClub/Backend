import { NotFoundException } from '@nestjs/common';
import { UpdateIndividualOrderStatusUseCase } from './update-individual-order-status.use-case';
import { IndividualOrderStatus } from '../../domain/repositories/individual-order.repository.interface';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

describe('UpdateIndividualOrderStatusUseCase', () => {
  let individualRepo: any;
  let companyOrderRepo: any;
  let useCase: UpdateIndividualOrderStatusUseCase;

  beforeEach(() => {
    individualRepo = {
      getById: jest.fn(),
      updateStatus: jest.fn(),
      areAllOrdersCompleted: jest.fn(),
    };
    companyOrderRepo = { updateStatus: jest.fn() };
    useCase = new UpdateIndividualOrderStatusUseCase(
      individualRepo,
      companyOrderRepo,
    );
  });

  it('lança NotFoundException quando o pedido individual não existe', async () => {
    individualRepo.getById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, IndividualOrderStatus.PREPARING),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('atualiza status sem mexer no pedido da empresa quando status não é COMPLETED', async () => {
    individualRepo.getById.mockResolvedValue({ id: 1, companyOrderId: 50 });

    const result = await useCase.execute(1, IndividualOrderStatus.PREPARING);

    expect(individualRepo.updateStatus).toHaveBeenCalledWith(
      1,
      IndividualOrderStatus.PREPARING,
    );
    expect(companyOrderRepo.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Status do pedido individual atualizado com sucesso',
    });
  });

  it('marca pedido da empresa como DELIVERED quando COMPLETED e todos estão completos', async () => {
    individualRepo.getById.mockResolvedValue({ id: 1, companyOrderId: 50 });
    individualRepo.areAllOrdersCompleted.mockResolvedValue(true);

    const result = await useCase.execute(1, IndividualOrderStatus.COMPLETED);

    expect(companyOrderRepo.updateStatus).toHaveBeenCalledWith(
      50,
      CompanyOrderStatus.DELIVERED,
    );
    expect(result.companyOrderUpdated).toBe(true);
  });

  it('não atualiza pedido da empresa quando COMPLETED mas nem todos estão completos', async () => {
    individualRepo.getById.mockResolvedValue({ id: 1, companyOrderId: 50 });
    individualRepo.areAllOrdersCompleted.mockResolvedValue(false);

    const result = await useCase.execute(1, IndividualOrderStatus.COMPLETED);

    expect(companyOrderRepo.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Status do pedido individual atualizado com sucesso',
    });
  });
});
