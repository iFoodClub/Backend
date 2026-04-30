import { BadRequestException } from '@nestjs/common';
import { CreateUserService } from './create-user.use-cases';

describe('CreateUserService', () => {
  let userRepo: any;
  let authService: any;
  let createEmployeeService: any;
  let createCompanyService: any;
  let createRestaurantService: any;
  let service: CreateUserService;

  beforeEach(() => {
    userRepo = { create: jest.fn().mockResolvedValue({ id: 100 }) };
    authService = { hashPassword: jest.fn().mockResolvedValue('HASHED') };
    createEmployeeService = {
      validateUserCreateEmployee: jest.fn().mockResolvedValue(true),
      execute: jest.fn(),
    };
    createCompanyService = {
      validateUserCreateCompany: jest.fn().mockResolvedValue(true),
      execute: jest.fn(),
    };
    createRestaurantService = {
      validateUserCreateRestaurant: jest.fn(),
      execute: jest.fn(),
    };
    service = new CreateUserService(
      userRepo,
      authService,
      createEmployeeService,
      createCompanyService,
      createRestaurantService,
    );
  });

  it('cria usuário do tipo employee e delega para CreateEmployeeService', async () => {
    const data: any = {
      email: 'e@e.com',
      password: 'plain',
      userType: 'employee',
      name: 'Emp',
      cpf: '111',
      employee: { birthDate: '2000-01-01', vacation: false },
      company: { id: 1 },
    };

    const result = await service.execute(data);

    expect(authService.hashPassword).toHaveBeenCalledWith('plain');
    expect(createEmployeeService.validateUserCreateEmployee).toHaveBeenCalled();
    expect(userRepo.create).toHaveBeenCalled();
    expect(createEmployeeService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf: '111',
        companyId: 1,
        userId: 100,
      }),
    );
    expect(result.id).toBe(100);
    expect(result.password).toBe('HASHED');
  });

  it('lança BadRequestException quando CPF já existe (employee)', async () => {
    createEmployeeService.validateUserCreateEmployee.mockResolvedValue(false);

    await expect(
      service.execute({
        email: 'e@e.com',
        password: 'plain',
        userType: 'employee',
        name: 'Emp',
        cpf: '111',
        employee: { birthDate: '2000-01-01' },
        company: { id: 1 },
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('cria usuário do tipo company e delega para CreateCompanyService', async () => {
    const data: any = {
      email: 'c@c.com',
      password: 'plain',
      userType: 'company',
      name: 'Co',
      cnpj: '999',
      company: { cep: '0', number: '1', restaurantId: null },
    };

    await service.execute(data);

    expect(createCompanyService.validateUserCreateCompany).toHaveBeenCalled();
    expect(createCompanyService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: '999',
        userId: 100,
      }),
    );
  });

  it('lança BadRequestException quando CNPJ já existe (company)', async () => {
    createCompanyService.validateUserCreateCompany.mockResolvedValue(false);

    await expect(
      service.execute({
        email: 'c@c.com',
        password: 'plain',
        userType: 'company',
        name: 'Co',
        cnpj: '999',
        company: { cep: '0', number: '1' },
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cria usuário do tipo restaurant e delega para CreateRestaurantService', async () => {
    const data: any = {
      email: 'r@r.com',
      password: 'plain',
      userType: 'restaurant',
      name: 'R',
      cnpj: '999',
      restaurant: {
        cep: '0',
        rua: 'r',
        cidade: 'c',
        estado: 's',
        number: '1',
        complemento: '',
      },
    };

    await service.execute(data);

    expect(createRestaurantService.validateUserCreateRestaurant).toHaveBeenCalled();
    expect(createRestaurantService.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: '999',
        userId: 100,
      }),
    );
  });
});
