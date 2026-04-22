import { ListRestaurantService } from './list-restaurant.use-cases';

describe('ListRestaurantService', () => {
  let restaurantRepo: any;
  let restaurantRatingRepo: any;
  let userRepo: any;
  let dishRepo: any;
  let service: ListRestaurantService;

  beforeEach(() => {
    restaurantRepo = { list: jest.fn() };
    restaurantRatingRepo = { getByRestaurantId: jest.fn() };
    userRepo = { getById: jest.fn() };
    dishRepo = { listByRestaurant: jest.fn() };
    service = new ListRestaurantService(
      restaurantRepo,
      restaurantRatingRepo,
      userRepo,
      dishRepo,
    );
  });

  it('retorna restaurantes com averageRating, minPrice e dishCount', async () => {
    restaurantRepo.list.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        name: 'R1',
        cnpj: 'x',
        cep: '0',
        number: '1',
        rua: 'r',
        cidade: 'c',
        estado: 's',
        complemento: '',
      },
    ]);
    restaurantRatingRepo.getByRestaurantId.mockResolvedValue([
      { rating: 4 },
      { rating: 2 },
    ]);
    userRepo.getById.mockResolvedValue({ id: 10, profileImage: 'img.png' });
    dishRepo.listByRestaurant.mockResolvedValue([
      { id: 1, price: 20 },
      { id: 2, price: 15 },
      { id: 3, price: 30 },
    ]);

    const result = await service.execute();

    expect(result[0]).toMatchObject({
      id: 1,
      profileImage: 'img.png',
      averageRating: 3,
      minPrice: 15,
      dishCount: 3,
    });
  });

  it('retorna minPrice=null quando não há pratos', async () => {
    restaurantRepo.list.mockResolvedValue([
      { id: 1, userId: 10, name: 'R1' },
    ]);
    restaurantRatingRepo.getByRestaurantId.mockResolvedValue([{ rating: 5 }]);
    userRepo.getById.mockResolvedValue({ id: 10, profileImage: 'img.png' });
    dishRepo.listByRestaurant.mockResolvedValue([]);

    const result = await service.execute();

    expect(result[0].minPrice).toBeNull();
    expect(result[0].dishCount).toBe(0);
  });
});
