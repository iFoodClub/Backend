import { NotFoundException } from '@nestjs/common';
import { CreateRestaurantRatingService } from './create-restaurant-rating.use-cases';

describe('CreateRestaurantRatingService', () => {
  let restaurantRatingRepo: any;
  let restaurantRepo: any;
  let service: CreateRestaurantRatingService;

  beforeEach(() => {
    restaurantRatingRepo = { create: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    service = new CreateRestaurantRatingService(
      restaurantRatingRepo,
      restaurantRepo,
    );
  });

  it('cria rating quando o restaurante existe', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 7 });
    restaurantRatingRepo.create.mockResolvedValue({
      id: 1,
      restaurantId: 7,
      rating: 4,
    });

    const result = await service.execute({
      restaurantId: 7,
      rating: 4,
      userId: 1,
    } as any);

    expect(restaurantRatingRepo.create).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 1, restaurantId: 7 });
  });

  it('lança NotFoundException quando o restaurante não existe', async () => {
    restaurantRepo.getById.mockResolvedValue(null);

    await expect(
      service.execute({ restaurantId: 404, rating: 2, userId: 1 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(restaurantRatingRepo.create).not.toHaveBeenCalled();
  });
});
