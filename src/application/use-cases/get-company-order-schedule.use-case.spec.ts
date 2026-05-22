import { NotFoundException } from '@nestjs/common';
import { GetCompanyOrderScheduleUseCase } from './get-company-order-schedule.use-case';

describe('GetCompanyOrderScheduleUseCase', () => {
  let companyRepo: any;
  let restaurantRepo: any;
  let scheduleRepo: any;
  let useCase: GetCompanyOrderScheduleUseCase;

  beforeEach(() => {
    companyRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    scheduleRepo = { findByCompany: jest.fn() };
    useCase = new GetCompanyOrderScheduleUseCase(
      companyRepo,
      restaurantRepo,
      scheduleRepo,
    );
  });

  it('lança NotFound quando a empresa não existe', async () => {
    companyRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna schedule vazia e operatingHours nulo quando não há restaurante associado', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: null });
    scheduleRepo.findByCompany.mockResolvedValue([]);

    const result = await useCase.execute(1);

    expect(result.companyId).toBe(1);
    expect(result.restaurantOperatingHours).toBeNull();
    expect(result.schedule).toEqual([]);
    expect(restaurantRepo.getById).not.toHaveBeenCalled();
  });

  it('retorna horários do restaurante quando associado', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 5 });
    restaurantRepo.getById.mockResolvedValue({
      id: 5,
      openingTime: '08:00',
      closingTime: '18:00',
    });
    scheduleRepo.findByCompany.mockResolvedValue([
      { id: 1, companyId: 1, dayOfWeek: 'Monday', triggerTime: '12:00' },
    ]);

    const result = await useCase.execute(1);

    expect(result.restaurantOperatingHours).toEqual({
      restaurantId: 5,
      openingTime: '08:00',
      closingTime: '18:00',
    });
    expect(result.schedule).toHaveLength(1);
  });

  it('lida com restaurantes sem horários cadastrados', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 5 });
    restaurantRepo.getById.mockResolvedValue({ id: 5 });
    scheduleRepo.findByCompany.mockResolvedValue([]);

    const result = await useCase.execute(1);

    expect(result.restaurantOperatingHours).toEqual({
      restaurantId: 5,
      openingTime: null,
      closingTime: null,
    });
  });
});
