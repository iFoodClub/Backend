import { NotFoundException } from '@nestjs/common';
import { DeleteWeeklyOrderService } from './delete-weekly-order.use-cases';

describe('DeleteWeeklyOrderService', () => {
  let repo: { getById: jest.Mock; delete: jest.Mock };
  let service: DeleteWeeklyOrderService;

  beforeEach(() => {
    repo = { getById: jest.fn(), delete: jest.fn() };
    service = new DeleteWeeklyOrderService(repo as any);
  });

  it('deleta o pedido semanal quando ele existe', async () => {
    repo.getById.mockResolvedValue({ id: 1 });

    await service.execute(1);

    expect(repo.getById).toHaveBeenCalledWith(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('lança NotFoundException quando o pedido semanal não existe', async () => {
    repo.getById.mockResolvedValue(null);

    await expect(service.execute(99)).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
