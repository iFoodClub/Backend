import { GetListByRestaurantService } from './list-byrestaurant.use-cases';

describe('GetListByRestaurantService', () => {
  let restaurantRatingRepo: any;
  let userRepo: any;
  let employeeRepo: any;
  let service: GetListByRestaurantService;

  beforeEach(() => {
    restaurantRatingRepo = { listByRestaurant: jest.fn() };
    userRepo = { getById: jest.fn() };
    employeeRepo = { getByUserId: jest.fn() };
    service = new GetListByRestaurantService(
      restaurantRatingRepo,
      userRepo,
      employeeRepo,
    );
  });

  it('retorna ratings com employeeName', async () => {
    restaurantRatingRepo.listByRestaurant.mockResolvedValue([
      { id: 1, restaurantId: 10, userId: 2, rating: 4, description: 'ok' },
    ]);
    userRepo.getById.mockResolvedValue({ id: 2 });
    employeeRepo.getByUserId.mockResolvedValue({ name: 'Alice' });

    const result = await service.execute(10);

    expect(result).toEqual([
      {
        id: 1,
        restaurantId: 10,
        userId: 2,
        employeeName: 'Alice',
        rating: 4,
        description: 'ok',
      },
    ]);
  });

  it('retorna lista vazia quando não há ratings do restaurante', async () => {
    restaurantRatingRepo.listByRestaurant.mockResolvedValue([]);

    await expect(service.execute(10)).resolves.toEqual([]);
    expect(userRepo.getById).not.toHaveBeenCalled();
  });
});
