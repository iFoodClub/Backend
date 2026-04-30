import { GetByRestaurantAndUserService } from './get-byrestaurant-and-user.use-cases';

describe('GetByRestaurantAndUserService', () => {
  let restaurantRatingRepo: any;
  let restaurantRepo: any;
  let service: GetByRestaurantAndUserService;

  beforeEach(() => {
    restaurantRatingRepo = { getByUserId: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    service = new GetByRestaurantAndUserService(
      restaurantRatingRepo,
      restaurantRepo,
    );
  });

  it('retorna cada rating com nome do restaurante anexado', async () => {
    restaurantRatingRepo.getByUserId.mockResolvedValue([
      { id: 1, restaurantId: 10, userId: 2, rating: 4, description: 'ok' },
    ]);
    restaurantRepo.getById.mockResolvedValue({ id: 10, name: 'R1' });

    const result = await service.execute(2);

    expect(result).toEqual([
      {
        id: 1,
        restaurantId: 10,
        restaurantName: 'R1',
        userId: 2,
        rating: 4,
        description: 'ok',
      },
    ]);
  });

  it('retorna lista vazia quando o usuário não tem ratings', async () => {
    restaurantRatingRepo.getByUserId.mockResolvedValue([]);

    await expect(service.execute(2)).resolves.toEqual([]);
    expect(restaurantRepo.getById).not.toHaveBeenCalled();
  });
});
