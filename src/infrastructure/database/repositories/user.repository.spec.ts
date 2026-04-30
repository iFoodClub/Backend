import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let userEntity: any;
  let repo: UserRepository;

  beforeEach(() => {
    userEntity = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };
    repo = new UserRepository(userEntity);
  });

  it('list delega para findAll', async () => {
    userEntity.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(repo.list()).resolves.toEqual([{ id: 1 }]);
  });

  it('create delega para create', async () => {
    const input = { email: 'e@e.com' } as any;
    userEntity.create.mockResolvedValue({ id: 1, ...input });
    await expect(repo.create(input)).resolves.toMatchObject({ id: 1 });
    expect(userEntity.create).toHaveBeenCalledWith(input);
  });

  it('findByEmail usa findOne com where', async () => {
    userEntity.findOne.mockResolvedValue({ id: 1 });
    await repo.findByEmail('a@a.com');
    expect(userEntity.findOne).toHaveBeenCalledWith({
      where: { email: 'a@a.com' },
    });
  });

  it('updateImage busca por id e chama update no instance', async () => {
    const instance = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    userEntity.findByPk.mockResolvedValue(instance);
    await repo.updateImage(1, { profileImage: 'x' } as any);
    expect(userEntity.findByPk).toHaveBeenCalledWith(1);
    expect(instance.update).toHaveBeenCalledWith({ profileImage: 'x' });
  });

  it('getById delega para findByPk', async () => {
    userEntity.findByPk.mockResolvedValue({ id: 5 });
    await expect(repo.getById(5)).resolves.toEqual({ id: 5 });
  });

  it('delete busca e destrói', async () => {
    const instance = { destroy: jest.fn() };
    userEntity.findByPk.mockResolvedValue(instance);
    await repo.delete(1);
    expect(instance.destroy).toHaveBeenCalled();
  });
});
