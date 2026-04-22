import { AverageRatingByRestaurantService } from './average-rating-by-restaurant.use-cases';

describe('AverageRatingByRestaurantService', () => {
  let dishRepo: any;
  let dishRatingRepo: any;
  let service: AverageRatingByRestaurantService;

  beforeEach(() => {
    dishRepo = { listByRestaurant: jest.fn() };
    dishRatingRepo = { listByDish: jest.fn() };
    service = new AverageRatingByRestaurantService(dishRepo, dishRatingRepo);
  });

  it('retorna média calculada quando há ratings', async () => {
    dishRepo.listByRestaurant.mockResolvedValue([
      { id: 1, name: 'A', restaurantId: 10, price: 20 },
    ]);
    dishRatingRepo.listByDish.mockResolvedValue([{ rating: 4 }, { rating: 2 }]);

    const result = await service.execute(10);

    expect(result).toEqual([
      { id: 1, name: 'A', restaurantId: 10, price: 20, averageRating: 3 },
    ]);
  });

  it('retorna averageRating=null quando o prato não tem ratings', async () => {
    dishRepo.listByRestaurant.mockResolvedValue([
      { id: 1, name: 'A', restaurantId: 10, price: 20 },
    ]);
    dishRatingRepo.listByDish.mockResolvedValue([]);

    const result = await service.execute(10);

    expect(result[0].averageRating).toBeNull();
  });

  it('retorna lista vazia quando não há pratos', async () => {
    dishRepo.listByRestaurant.mockResolvedValue([]);

    await expect(service.execute(10)).resolves.toEqual([]);
    expect(dishRatingRepo.listByDish).not.toHaveBeenCalled();
  });
});
