import { NotFoundException } from '@nestjs/common';
import { CreateDishRatingService } from './create-dish-rating.use-cases';

describe('CreateDishRatingService', () => {
  let dishRatingRepo: any;
  let dishRepo: any;
  let service: CreateDishRatingService;

  beforeEach(() => {
    dishRatingRepo = { create: jest.fn() };
    dishRepo = { getById: jest.fn() };
    service = new CreateDishRatingService(dishRatingRepo, dishRepo);
  });

  it('cria rating quando o prato existe', async () => {
    dishRepo.getById.mockResolvedValue({ id: 10 });
    dishRatingRepo.create.mockResolvedValue({ id: 1, dishId: 10, rating: 5 });

    const result = await service.execute({
      dishId: 10,
      rating: 5,
      userId: 2,
    } as any);

    expect(dishRepo.getById).toHaveBeenCalledWith(10);
    expect(dishRatingRepo.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, dishId: 10, rating: 5 });
  });

  it('lança NotFoundException quando o prato não existe', async () => {
    dishRepo.getById.mockResolvedValue(null);

    await expect(
      service.execute({ dishId: 404, rating: 3, userId: 2 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(dishRatingRepo.create).not.toHaveBeenCalled();
  });
});
