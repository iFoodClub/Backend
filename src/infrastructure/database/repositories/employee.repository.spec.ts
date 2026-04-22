import { EmployeeRepository } from './employee.repository';

describe('EmployeeRepository', () => {
  let employeeEntity: any;
  let userEntity: any;
  let companyEntity: any;
  let repo: EmployeeRepository;

  beforeEach(() => {
    employeeEntity = {
      findAll: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    };
    userEntity = {};
    companyEntity = {};
    repo = new EmployeeRepository(employeeEntity, userEntity, companyEntity);
  });

  it('list mapeia company e birthDate', async () => {
    employeeEntity.findAll.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        companyId: 5,
        company: { id: 5, restaurantId: 2 },
        name: 'E',
        cpf: '1',
        birthDate: '2000-01-01T00:00:00.000Z',
        vacation: false,
      },
    ]);

    const result = await repo.list();
    expect(result[0]).toMatchObject({
      id: 1,
      userId: 10,
      company: { id: 5, selectedRestaurantId: 2 },
      birthDate: '2000-01-01',
    });
  });

  it('list retorna birthDate vazio quando ausente', async () => {
    employeeEntity.findAll.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        companyId: 5,
        company: null,
        name: 'E',
        cpf: '1',
        birthDate: null,
        vacation: false,
      },
    ]);
    const r = await repo.list();
    expect(r[0].birthDate).toBe('');
    expect(r[0].company.selectedRestaurantId).toBeNull();
  });

  it('create delega', async () => {
    employeeEntity.create.mockResolvedValue({ id: 1 });
    await expect(repo.create({} as any)).resolves.toEqual({ id: 1 });
  });

  it('update busca e chama update', async () => {
    const inst = { update: jest.fn().mockResolvedValue({ id: 1 }) };
    employeeEntity.findByPk.mockResolvedValue(inst);
    await repo.update(1, { name: 'X' } as any);
    expect(inst.update).toHaveBeenCalledWith({ name: 'X' });
  });

  it('getById retorna null quando não encontra', async () => {
    employeeEntity.findByPk.mockResolvedValue(null);
    await expect(repo.getById(1)).resolves.toBeNull();
  });

  it('getById mapeia employee com company', async () => {
    employeeEntity.findByPk.mockResolvedValue({
      id: 1,
      userId: 10,
      companyId: 5,
      company: { id: 5, restaurantId: 2 },
      name: 'E',
      cpf: '1',
      birthDate: '2000-01-01T00:00:00.000Z',
      vacation: false,
    });
    const r = await repo.getById(1);
    expect(r!.company.id).toBe(5);
    expect(r!.birthDate).toBe('2000-01-01');
  });

  it('getByUserId, findByCpf, findByUserId usam findOne', async () => {
    await repo.getByUserId(1);
    expect(employeeEntity.findOne).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    await repo.findByCpf('9');
    expect(employeeEntity.findOne).toHaveBeenCalledWith({
      where: { cpf: '9' },
    });
    await repo.findByUserId(1);
    expect(employeeEntity.findOne).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
  });

  it('listByCompany usa findAll com where', async () => {
    employeeEntity.findAll.mockResolvedValue([]);
    await repo.listByCompany(5);
    expect(employeeEntity.findAll).toHaveBeenCalledWith({
      where: { companyId: 5 },
    });
  });

  it('listByCompanyWithProfileImage mapeia com user.profileImage', async () => {
    employeeEntity.findAll.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        companyId: 5,
        name: 'E',
        cpf: '1',
        birthDate: '2000-01-01',
        vacation: false,
        user: { profileImage: 'img.jpg', email: 'e@e.com' },
      },
    ]);
    const r = await repo.listByCompanyWithProfileImage(5);
    expect(r[0].profileImage).toBe('img.jpg');
    expect(r[0].email).toBe('e@e.com');
  });

  it('listByCompanyWithProfileImage lida com user ausente', async () => {
    employeeEntity.findAll.mockResolvedValue([
      {
        id: 1,
        userId: 10,
        companyId: 5,
        name: 'E',
        cpf: '1',
        birthDate: '2000-01-01',
        vacation: false,
        user: null,
      },
    ]);
    const r = await repo.listByCompanyWithProfileImage(5);
    expect(r[0].profileImage).toBeNull();
    expect(r[0].email).toBe('');
  });

  it('delete busca e destrói', async () => {
    const inst = { destroy: jest.fn() };
    employeeEntity.findByPk.mockResolvedValue(inst);
    await repo.delete(1);
    expect(inst.destroy).toHaveBeenCalled();
  });
});
