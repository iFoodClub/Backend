import { NotFoundException } from '@nestjs/common';
import { DeleteUserService } from './delete-user.use-cases';

describe('DeleteUserService', () => {
  let userRepo: any;
  let employeeRepo: any;
  let companyRepo: any;
  let restaurantRepo: any;
  let weeklyOrdersRepo: any;
  let individualOrderRepo: any;
  let service: DeleteUserService;

  beforeEach(() => {
    userRepo = { getById: jest.fn(), delete: jest.fn() };
    employeeRepo = { findByUserId: jest.fn(), delete: jest.fn() };
    companyRepo = { findByUserId: jest.fn(), delete: jest.fn() };
    restaurantRepo = { findByUserId: jest.fn(), delete: jest.fn() };
    weeklyOrdersRepo = { findByEmployeeId: jest.fn(), delete: jest.fn() };
    individualOrderRepo = { listByEmployee: jest.fn(), delete: jest.fn() };

    service = new DeleteUserService(
      userRepo,
      employeeRepo,
      companyRepo,
      restaurantRepo,
      weeklyOrdersRepo,
      individualOrderRepo,
    );
  });

  it('lança NotFoundException quando o usuário não existe', async () => {
    userRepo.getById.mockResolvedValue(null);

    await expect(service.execute(1)).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepo.delete).not.toHaveBeenCalled();
  });

  it('deleta apenas o user quando não há employee/company/restaurant vinculados', async () => {
    userRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.findByUserId.mockResolvedValue(null);
    companyRepo.findByUserId.mockResolvedValue(null);
    restaurantRepo.findByUserId.mockResolvedValue(null);

    await service.execute(10);

    expect(userRepo.delete).toHaveBeenCalledWith(10);
    expect(employeeRepo.delete).not.toHaveBeenCalled();
    expect(companyRepo.delete).not.toHaveBeenCalled();
    expect(restaurantRepo.delete).not.toHaveBeenCalled();
  });

  it('deleta weekly orders e individual orders quando há employee', async () => {
    userRepo.getById.mockResolvedValue({ id: 10 });
    employeeRepo.findByUserId.mockResolvedValue({ id: 99 });
    weeklyOrdersRepo.findByEmployeeId.mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);
    individualOrderRepo.listByEmployee.mockResolvedValue([{ id: 5 }]);
    companyRepo.findByUserId.mockResolvedValue(null);
    restaurantRepo.findByUserId.mockResolvedValue(null);

    await service.execute(10);

    expect(weeklyOrdersRepo.delete).toHaveBeenCalledWith(1);
    expect(weeklyOrdersRepo.delete).toHaveBeenCalledWith(2);
    expect(individualOrderRepo.delete).toHaveBeenCalledWith(5);
    expect(employeeRepo.delete).toHaveBeenCalledWith(99);
    expect(userRepo.delete).toHaveBeenCalledWith(10);
  });

  it('deleta company quando vinculada ao user', async () => {
    userRepo.getById.mockResolvedValue({ id: 20 });
    employeeRepo.findByUserId.mockResolvedValue(null);
    companyRepo.findByUserId.mockResolvedValue({ id: 77 });
    restaurantRepo.findByUserId.mockResolvedValue(null);

    await service.execute(20);

    expect(companyRepo.delete).toHaveBeenCalledWith(77);
    expect(userRepo.delete).toHaveBeenCalledWith(20);
  });

  it('deleta restaurant quando vinculado ao user', async () => {
    userRepo.getById.mockResolvedValue({ id: 30 });
    employeeRepo.findByUserId.mockResolvedValue(null);
    companyRepo.findByUserId.mockResolvedValue(null);
    restaurantRepo.findByUserId.mockResolvedValue({ id: 88 });

    await service.execute(30);

    expect(restaurantRepo.delete).toHaveBeenCalledWith(88);
    expect(userRepo.delete).toHaveBeenCalledWith(30);
  });
});
