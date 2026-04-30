import { BadRequestException } from '@nestjs/common';
import { CreateRestaurantService } from './create-restaurant.use-cases';

describe('CreateRestaurantService', () => {
  let restaurantRepo: any;
  let eligibility: any;
  let service: CreateRestaurantService;

  const baseRestaurant = { userId: 2, name: 'R', cnpj: '111' };

  beforeEach(() => {
    restaurantRepo = { list: jest.fn().mockResolvedValue([]), create: jest.fn() };
    eligibility = { assertEligibleForProfile: jest.fn() };
    service = new CreateRestaurantService(restaurantRepo, eligibility);
  });

  it('cria restaurant quando elegível e CNPJ não duplica', async () => {
    await service.execute(baseRestaurant as any);

    expect(eligibility.assertEligibleForProfile).toHaveBeenCalledWith(
      2,
      'restaurant',
    );
    expect(restaurantRepo.create).toHaveBeenCalled();
  });

  it('lança BadRequestException quando o CNPJ já existe', async () => {
    restaurantRepo.list.mockResolvedValue([{ cnpj: '111' }]);

    await expect(service.execute(baseRestaurant as any)).rejects.toMatchObject({
      message: expect.stringContaining('CNPJ'),
    });
    expect(restaurantRepo.create).not.toHaveBeenCalled();
  });

  describe('validateUserCreateRestaurant', () => {
    it('retorna true quando não há duplicidade', async () => {
      restaurantRepo.list.mockResolvedValue([{ cnpj: '222' }]);

      await expect(
        service.validateUserCreateRestaurant({ cnpj: '111' } as any),
      ).resolves.toBe(true);
    });

    it('retorna false quando o CNPJ já existe', async () => {
      restaurantRepo.list.mockResolvedValue([{ cnpj: '111' }]);

      await expect(
        service.validateUserCreateRestaurant({ cnpj: '111' } as any),
      ).resolves.toBe(false);
    });
  });
});
