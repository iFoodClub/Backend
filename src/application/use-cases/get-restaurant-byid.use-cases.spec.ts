import { GetRestaurantByIdService } from './get-restaurant-byid.use-cases';

describe('GetRestaurantByIdService', () => {
  let restaurantRepo: any;
  let dishRepo: any;
  let restaurantRatingRepo: any;
  let employeeRepo: any;
  let userRepo: any;
  let service: GetRestaurantByIdService;

  beforeEach(() => {
    restaurantRepo = { getById: jest.fn() };
    dishRepo = { listByRestaurant: jest.fn() };
    restaurantRatingRepo = { listByRestaurant: jest.fn() };
    employeeRepo = { getByUserId: jest.fn() };
    userRepo = { getById: jest.fn() };
    service = new GetRestaurantByIdService(
      restaurantRepo,
      dishRepo,
      restaurantRatingRepo,
      employeeRepo,
      userRepo,
    );
  });

  it('retorna null quando o restaurante não existe', async () => {
    restaurantRepo.getById.mockResolvedValue(null);

    await expect(service.execute(1)).resolves.toBeNull();
    expect(dishRepo.listByRestaurant).not.toHaveBeenCalled();
  });

  it('retorna restaurante com dishes, ratings (employeeName) e averageRating', async () => {
    restaurantRepo.getById.mockResolvedValue({
      id: 1,
      userId: 99,
      name: 'R1',
      cnpj: '00',
      cep: '0',
      number: '1',
      rua: 'r',
      cidade: 'c',
      estado: 's',
      complemento: '',
    });
    dishRepo.listByRestaurant.mockResolvedValue([{ id: 7 }]);
    restaurantRatingRepo.listByRestaurant.mockResolvedValue([
      { id: 1, restaurantId: 1, userId: 50, rating: 4, description: 'ok' },
      { id: 2, restaurantId: 1, userId: 51, rating: 2, description: null },
    ]);
    employeeRepo.getByUserId
      .mockResolvedValueOnce({ name: 'Alice' })
      .mockResolvedValueOnce({ name: 'Bob' });
    userRepo.getById.mockResolvedValue({ id: 99, profileImage: 'img.png' });

    const result = await service.execute(1);

    expect(result).toMatchObject({
      id: 1,
      profileImage: 'img.png',
      averageRating: 3,
      dishes: [{ id: 7 }],
    });
    expect(result!.restaurantRatings).toHaveLength(2);
    expect(result!.restaurantRatings[0]).toMatchObject({ employeeName: 'Alice' });
  });

  it('retorna averageRating=0 quando não há ratings', async () => {
    restaurantRepo.getById.mockResolvedValue({
      id: 1,
      userId: 99,
      name: 'R1',
    });
    dishRepo.listByRestaurant.mockResolvedValue([]);
    restaurantRatingRepo.listByRestaurant.mockResolvedValue([]);
    userRepo.getById.mockResolvedValue({ id: 99, profileImage: 'img.png' });

    const result = await service.execute(1);

    expect(result!.averageRating).toBe(0);
    expect(result!.restaurantRatings).toEqual([]);
  });
});
