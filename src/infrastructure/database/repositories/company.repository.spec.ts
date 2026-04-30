import { CompanyRepository } from './company.repository';

describe('CompanyRepository', () => {
  let entity: any;
  let repo: CompanyRepository;

  beforeEach(() => {
    entity = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    repo = new CompanyRepository(entity);
  });

  it('create delega para entity.create', async () => {
    entity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({ cnpj: '9' } as any)).resolves.toEqual({ id: 1 });
  });

  it('update busca por pk e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    entity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { name: 'X' } as any);
    expect(inst.update).toHaveBeenCalledWith({ name: 'X' });
  });

  it('getById delega', async () => {
    entity.findByPk.mockResolvedValue({ id: 1 });
    await expect(repo.getById(1)).resolves.toEqual({ id: 1 });
  });

  it('list delega', async () => {
    entity.findAll.mockResolvedValue([{ id: 1 }]);
    await expect(repo.list()).resolves.toEqual([{ id: 1 }]);
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    entity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });

  it('findByCnpj passa where', async () => {
    await repo.findByCnpj('999');
    expect(entity.findOne).toHaveBeenCalledWith({ where: { cnpj: '999' } });
  });

  it('findByUserId passa where', async () => {
    await repo.findByUserId(10);
    expect(entity.findOne).toHaveBeenCalledWith({ where: { userId: 10 } });
  });
});
