import { DishRatingRepository } from './dish-rating.repository';

describe('DishRatingRepository', () => {
  let entity: any;
  let repo: DishRatingRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };
    repo = new DishRatingRepository(entity);
  });

  it('create delega', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('getByDishAndUser usa findAll com where userId', async () => {
    await repo.getByDishAndUser(10);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { userId: 10 } });
  });

  it('update busca e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { rating: 4 } as any);
    expect(inst.update).toHaveBeenCalledWith({ rating: 4 });
  });

  it('listByDish aplica where dishId e include', async () => {
    entity.findAll.mockResolvedValue([{ id: 1 }]);
    await repo.listByDish(3);
    const arg = entity.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ dishId: 3 });
    expect(Array.isArray(arg.include)).toBe(true);
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });
});
