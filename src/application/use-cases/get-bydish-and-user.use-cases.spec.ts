import { GetByDishAndUserService } from './get-bydish-and-user.use-cases';

describe('GetByDishAndUserService', () => {
  let dishRatingRepo: any;
  let dishRepo: any;
  let restaurantRepo: any;
  let employeeRepo: any;
  let service: GetByDishAndUserService;

  beforeEach(() => {
    dishRatingRepo = { getByDishAndUser: jest.fn() };
    dishRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    employeeRepo = { getByUserId: jest.fn() };
    service = new GetByDishAndUserService(
      dishRatingRepo,
      dishRepo,
      restaurantRepo,
      employeeRepo,
    );
  });

  it('enriquece ratings com dishName, restaurantName e employeeName', async () => {
    dishRatingRepo.getByDishAndUser.mockResolvedValue([
      { id: 1, dishId: 10, rating: 5, description: 'ok', userId: 2 },
    ]);
    dishRepo.getById.mockResolvedValue({ id: 10, name: 'Pizza', restaurantId: 100 });
    restaurantRepo.getById.mockResolvedValue({ id: 100, name: 'R1' });
    employeeRepo.getByUserId.mockResolvedValue({ name: 'Alice' });

    const result = await service.execute(2);

    expect(result).toEqual([
      {
        id: 1,
        rating: 5,
        description: 'ok',
        dishId: 10,
        dishName: 'Pizza',
        restaurantId: 100,
        restaurantName: 'R1',
        userId: 2,
        employeeName: 'Alice',
      },
    ]);
  });

  it('retorna lista vazia quando não há ratings', async () => {
    dishRatingRepo.getByDishAndUser.mockResolvedValue([]);

    await expect(service.execute(1)).resolves.toEqual([]);
    expect(dishRepo.getById).not.toHaveBeenCalled();
  });
});
