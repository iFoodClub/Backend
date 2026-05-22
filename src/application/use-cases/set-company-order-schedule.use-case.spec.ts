import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SetCompanyOrderScheduleUseCase } from './set-company-order-schedule.use-case';
import { ValidateTriggerTimeWithinOperatingHoursUseCase } from './validate-trigger-time-within-operating-hours.use-case';

describe('SetCompanyOrderScheduleUseCase', () => {
  let companyRepo: any;
  let restaurantRepo: any;
  let scheduleRepo: any;
  let validateTriggerTime: ValidateTriggerTimeWithinOperatingHoursUseCase;
  let useCase: SetCompanyOrderScheduleUseCase;

  beforeEach(() => {
    companyRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    scheduleRepo = { bulkUpsert: jest.fn() };
    validateTriggerTime = new ValidateTriggerTimeWithinOperatingHoursUseCase();

    useCase = new SetCompanyOrderScheduleUseCase(
      companyRepo,
      restaurantRepo,
      scheduleRepo,
      validateTriggerTime,
    );
  });

  it('lança NotFound quando a empresa não existe', async () => {
    companyRepo.getById.mockResolvedValue(null);
    await expect(
      useCase.execute(1, {
        schedule: [{ dayOfWeek: 'Monday', triggerTime: '12:00' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança BadRequest quando a empresa não tem restaurante selecionado', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: null });
    await expect(
      useCase.execute(1, {
        schedule: [{ dayOfWeek: 'Monday', triggerTime: '12:00' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança NotFound quando o restaurante não é encontrado', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 99 });
    restaurantRepo.getById.mockResolvedValue(null);
    await expect(
      useCase.execute(1, {
        schedule: [{ dayOfWeek: 'Monday', triggerTime: '12:00' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lança BadRequest quando há dias duplicados no payload', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 99 });
    restaurantRepo.getById.mockResolvedValue({
      id: 99,
      name: 'R',
      openingTime: '08:00',
      closingTime: '20:00',
    });
    await expect(
      useCase.execute(1, {
        schedule: [
          { dayOfWeek: 'Monday', triggerTime: '12:00' },
          { dayOfWeek: 'Monday', triggerTime: '13:00' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança BadRequest quando o triggerTime está fora do horário do restaurante', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 99 });
    restaurantRepo.getById.mockResolvedValue({
      id: 99,
      name: 'Casa do Sabor',
      openingTime: '11:00',
      closingTime: '15:00',
    });

    await expect(
      useCase.execute(1, {
        schedule: [{ dayOfWeek: 'Monday', triggerTime: '20:00' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(scheduleRepo.bulkUpsert).not.toHaveBeenCalled();
  });

  it('persiste todos os horários quando todos estão dentro do range', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1, restaurantId: 99 });
    restaurantRepo.getById.mockResolvedValue({
      id: 99,
      name: 'Casa do Sabor',
      openingTime: '08:00',
      closingTime: '18:00',
    });
    const payload = [
      { dayOfWeek: 'Monday', triggerTime: '12:00' },
      { dayOfWeek: 'Tuesday', triggerTime: '12:30' },
    ];
    scheduleRepo.bulkUpsert.mockResolvedValue(
      payload.map((item, idx) => ({ id: idx + 1, companyId: 1, ...item })),
    );

    const result = await useCase.execute(1, { schedule: payload as any });

    expect(scheduleRepo.bulkUpsert).toHaveBeenCalledWith(1, payload);
    expect(result).toHaveLength(2);
  });
});
