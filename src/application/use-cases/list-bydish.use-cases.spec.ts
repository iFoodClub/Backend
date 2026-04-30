import { GetListByDishService } from './list-bydish.use-cases';

describe('GetListByDishService', () => {
  let dishRatingRepo: any;
  let employeeRepo: any;
  let service: GetListByDishService;

  beforeEach(() => {
    dishRatingRepo = { listByDish: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    service = new GetListByDishService(dishRatingRepo, employeeRepo);
  });

  it('retorna ratings com nome do employee, média e contagem', async () => {
    dishRatingRepo.listByDish.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        rating: 4,
        description: 'ok',
        user: { profileImage: 'p1.png' },
      },
      {
        id: 2,
        userId: 11,
        rating: 2,
        description: null,
        user: { profileImage: null },
      },
    ]);
    employeeRepo.findByUserId
      .mockResolvedValueOnce({ name: 'Alice' })
      .mockResolvedValueOnce({ name: 'Bob' });

    const result = await service.execute(99);

    expect(result.ratingCount).toBe(2);
    expect(result.averageRating).toBe(3);
    expect(result.ratings[0]).toEqual({
      id: 1,
      name: 'Alice',
      rating: 4,
      profileImage: 'p1.png',
      description: 'ok',
    });
    expect(result.ratings[1]).toMatchObject({ name: 'Bob' });
  });

  it('usa "Usuário" quando não há userId / employee', async () => {
    dishRatingRepo.listByDish.mockResolvedValue([
      {
        id: 1,
        userId: null,
        rating: 5,
        description: null,
        user: null,
      },
    ]);

    const result = await service.execute(1);

    expect(employeeRepo.findByUserId).not.toHaveBeenCalled();
    expect(result.ratings[0]).toMatchObject({
      name: 'Usuário',
      profileImage: null,
      description: null,
    });
  });

  it('retorna média 0 quando não há avaliações', async () => {
    dishRatingRepo.listByDish.mockResolvedValue([]);

    const result = await service.execute(1);

    expect(result).toEqual({ ratings: [], averageRating: 0, ratingCount: 0 });
  });
});
