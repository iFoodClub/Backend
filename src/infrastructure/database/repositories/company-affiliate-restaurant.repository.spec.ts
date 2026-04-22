import { CompanyAffiliateRestaurantRepository } from './company-affiliate-restaurant.repository';

describe('CompanyAffiliateRestaurantRepository', () => {
  let entity: any;
  let repo: CompanyAffiliateRestaurantRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
    };
    repo = new CompanyAffiliateRestaurantRepository(entity);
  });

  it('create delega', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('listByCompany / listByRestaurant usam findAll com where', async () => {
    await repo.listByCompany(1);
    expect(entity.findAll).toHaveBeenCalledWith({ where: { companyId: 1 } });
    await repo.listByRestaurant(2);
    expect(entity.findAll).toHaveBeenCalledWith({
      where: { restaurantId: 2 },
    });
  });

  it('delete usa destroy com where composto', async () => {
    await repo.delete(1, 2);
    expect(entity.destroy).toHaveBeenCalledWith({
      where: { companyId: 1, restaurantId: 2 },
    });
  });

  it('findAffiliation usa findOne com where composto', async () => {
    await repo.findAffiliation(1, 2);
    expect(entity.findOne).toHaveBeenCalledWith({
      where: { companyId: 1, restaurantId: 2 },
    });
  });
});
