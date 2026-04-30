import { ListDishesByRestaurantService } from './list-dishes-by-restaurant.use-cases';

describe('ListDishesByRestaurantService', () => {
  let dishRepo: any;
  let dishRatingRepo: any;
  let employeeRepo: any;
  let service: ListDishesByRestaurantService;

  beforeEach(() => {
    dishRepo = { listByRestaurant: jest.fn() };
    dishRatingRepo = { listByDish: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    service = new ListDishesByRestaurantService(
      dishRepo,
      dishRatingRepo,
      employeeRepo,
    );
  });

  it('filtra pratos pelo restaurantId e enriquece com ratings/médias', async () => {
    dishRepo.listByRestaurant.mockResolvedValue([
      { id: 1, restaurantId: 77, name: 'Pizza', description: '', price: 30, image: '' },
    ]);
    dishRatingRepo.listByDish.mockResolvedValue([
      { id: 1, userId: 5, rating: 4, description: 'ok', user: { profileImage: 'a.png' } },
    ]);
    employeeRepo.findByUserId.mockResolvedValue({ name: 'Alice' });

    const result = await service.execute(77);

    expect(dishRepo.listByRestaurant).toHaveBeenCalledWith(77);
    expect(result[0]).toMatchObject({
      restaurantId: 77,
      averageRating: 4,
      ratingCount: 1,
    });
    expect(result[0].ratings[0].name).toBe('Alice');
  });

  it('retorna lista vazia quando não há pratos', async () => {
    dishRepo.listByRestaurant.mockResolvedValue([]);

    await expect(service.execute(1)).resolves.toEqual([]);
    expect(dishRatingRepo.listByDish).not.toHaveBeenCalled();
  });
});
