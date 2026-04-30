import { GetDishByIdService } from './get-dish-byid.use-cases';

describe('GetDishByIdService', () => {
  let dishRepo: any;
  let dishRatingRepo: any;
  let employeeRepo: any;
  let restaurantRepo: any;
  let service: GetDishByIdService;

  beforeEach(() => {
    dishRepo = { getById: jest.fn() };
    dishRatingRepo = { listByDish: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    service = new GetDishByIdService(
      dishRepo,
      dishRatingRepo,
      employeeRepo,
      restaurantRepo,
    );
  });

  it('retorna null quando o prato não existe', async () => {
    dishRepo.getById.mockResolvedValue(null);

    await expect(service.execute(404)).resolves.toBeNull();
    expect(restaurantRepo.getById).not.toHaveBeenCalled();
  });

  it('retorna prato com nome do restaurante, média e ratings', async () => {
    dishRepo.getById.mockResolvedValue({
      id: 1,
      restaurantId: 10,
      name: 'Pizza',
      description: '',
      price: 30,
      image: '',
    });
    restaurantRepo.getById.mockResolvedValue({ id: 10, name: 'Rest X' });
    dishRatingRepo.listByDish.mockResolvedValue([
      { id: 1, userId: 5, rating: 5, description: 'top', user: { profileImage: 'a' } },
      { id: 2, userId: 6, rating: 3, description: null, user: { profileImage: null } },
    ]);
    employeeRepo.findByUserId
      .mockResolvedValueOnce({ name: 'Alice' })
      .mockResolvedValueOnce(null);

    const result = await service.execute(1);

    expect(result).toMatchObject({
      id: 1,
      restaurantName: 'Rest X',
      averageRating: 4,
      ratingCount: 2,
    });
    expect(result!.ratings[0].name).toBe('Alice');
    expect(result!.ratings[1].name).toBe('Usuário');
  });

  it('retorna averageRating 0 e ratings vazio quando não há avaliações', async () => {
    dishRepo.getById.mockResolvedValue({
      id: 1,
      restaurantId: 10,
      name: 'Pizza',
      description: '',
      price: 30,
      image: '',
    });
    restaurantRepo.getById.mockResolvedValue({ id: 10, name: 'Rest X' });
    dishRatingRepo.listByDish.mockResolvedValue([]);

    const result = await service.execute(1);

    expect(result).toMatchObject({
      averageRating: 0,
      ratingCount: 0,
      ratings: [],
    });
  });
});
