import { RestaurantRatingRepository } from './restaurant-rating.repository';

describe('RestaurantRatingRepository', () => {
  let entity: any;
  let repo: RestaurantRatingRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };
    repo = new RestaurantRatingRepository(entity);
  });

  it('create delega', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('getByRestaurantAndUser usa findOne com where composto', async () => {
    await repo.getByRestaurantAndUser(1, 2);
    expect(entity.findOne).toHaveBeenCalledWith({
      where: { restaurantId: 1, userId: 2 },
    });
  });

  it('getByRestaurantId usa findAll', async () => {
    await repo.getByRestaurantId(1);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { restaurantId: 1 },
    });
  });

  it('getByUserId usa findAll', async () => {
    await repo.getByUserId(1);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { userId: 1 } });
  });

  it('update busca e atualiza', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { rating: 5 } as any);
    expect(inst.update).toHaveBeenCalledWith({ rating: 5 });
  });

  it('listByRestaurant aplica where e include', async () => {
    await repo.listByRestaurant(3);
    const arg = entity.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ restaurantId: 3 });
    expect(arg.include.length).toBe(1);
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });
});
