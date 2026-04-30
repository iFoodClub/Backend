import { ListDishesService } from './list-dishes.use-cases';

describe('ListDishesService', () => {
  let dishRepo: any;
  let dishRatingRepo: any;
  let employeeRepo: any;
  let service: ListDishesService;

  beforeEach(() => {
    dishRepo = { list: jest.fn() };
    dishRatingRepo = { listByDish: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    service = new ListDishesService(dishRepo, dishRatingRepo, employeeRepo);
  });

  it('retorna cada prato com média, contagem e ratings enriquecidos', async () => {
    dishRepo.list.mockResolvedValue([
      {
        id: 1,
        restaurantId: 10,
        name: 'Pizza',
        description: '',
        price: 30,
        image: 'p.png',
      },
    ]);
    dishRatingRepo.listByDish.mockResolvedValue([
      { id: 1, userId: 5, rating: 5, description: 'top', user: { profileImage: 'a.png' } },
      { id: 2, userId: null, rating: 3, description: null, user: null },
    ]);
    employeeRepo.findByUserId.mockResolvedValue({ name: 'Alice' });

    const result = await service.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      ratingCount: 2,
      averageRating: 4,
    });
    expect(result[0].ratings).toEqual([
      {
        id: 1,
        name: 'Alice',
        rating: 5,
        profileImage: 'a.png',
        description: 'top',
      },
      {
        id: 2,
        name: 'Usuário',
        rating: 3,
        profileImage: null,
        description: null,
      },
    ]);
  });

  it('retorna média 0 quando o prato não tem ratings', async () => {
    dishRepo.list.mockResolvedValue([
      { id: 1, restaurantId: 10, name: 'Pizza', description: '', price: 30, image: '' },
    ]);
    dishRatingRepo.listByDish.mockResolvedValue([]);

    const result = await service.execute();

    expect(result[0]).toMatchObject({ averageRating: 0, ratingCount: 0, ratings: [] });
  });
});
