import { NotFoundException } from '@nestjs/common';
import { ListIndividualOrderByCompanyUseCase } from './list-individual-order-by-company.use-case';

const wrap = (plain: any) => ({ get: () => plain });

describe('ListIndividualOrderByCompanyUseCase', () => {
  let individualRepo: any;
  let companyRepo: any;
  let companyOrderRepo: any;
  let employeeRepo: any;
  let userRepo: any;
  let restaurantRepo: any;
  let useCase: ListIndividualOrderByCompanyUseCase;

  beforeEach(() => {
    individualRepo = { listByCompanyOrderIdNullWithIncludes: jest.fn() };
    companyRepo = { getById: jest.fn() };
    companyOrderRepo = { findOrdersHistoryByCompany: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    userRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };

    useCase = new ListIndividualOrderByCompanyUseCase(
      individualRepo,
      companyRepo,
      companyOrderRepo,
      employeeRepo,
      userRepo,
      restaurantRepo,
    );
  });

  it('lança NotFound quando empresa não existe', async () => {
    companyRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna histórico vazio quando não há pedidos', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    companyOrderRepo.findOrdersHistoryByCompany.mockResolvedValue([]);
    individualRepo.listByCompanyOrderIdNullWithIncludes.mockResolvedValue([]);
    await expect(useCase.execute(1)).resolves.toEqual([]);
  });

  it('mapeia pedidos da empresa com total calculado e status traduzido', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    companyOrderRepo.findOrdersHistoryByCompany.mockResolvedValue([
      wrap({
        id: 10,
        status: 'pending',
        restaurantId: 5,
        restaurant: { id: 5, name: 'Rest', user: { profileImage: 'img' } },
        createdAt: new Date('2024-01-02'),
        collaboratorsOrders: [
          {
            id: 101,
            employeeId: 20,
            dishId: 200,
            status: 'preparing',
            dish: {
              id: 200,
              name: 'Pizza',
              image: 'p',
              price: '10.50',
              restaurantId: 5,
            },
          },
          {
            id: 102,
            employeeId: 21,
            dishId: 201,
            status: 'completed',
            dish: {
              id: 201,
              name: 'X',
              image: null,
              price: 5,
              restaurantId: 5,
            },
          },
        ],
      }),
    ]);
    individualRepo.listByCompanyOrderIdNullWithIncludes.mockResolvedValue([]);

    employeeRepo.getById.mockResolvedValue({
      id: 20,
      name: 'Alice',
      userId: 50,
    });
    userRepo.getById.mockResolvedValue({ id: 50, profileImage: 'avatar' });

    const result = await useCase.execute(1);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('CO-10');
    expect(result[0].status).toBe('Enviado');
    expect(result[0].totalPrice).toBeCloseTo(15.5);
    expect(result[0].employeeOrders).toHaveLength(2);
  });

  it('mapeia pedidos individuais sem companyOrder e ordena por data', async () => {
    companyRepo.getById.mockResolvedValue({ id: 1 });
    companyOrderRepo.findOrdersHistoryByCompany.mockResolvedValue([
      wrap({
        id: 1,
        status: 'confirmed',
        restaurantId: 5,
        restaurant: null,
        createdAt: new Date('2024-01-05'),
        collaboratorsOrders: [],
      }),
    ]);
    individualRepo.listByCompanyOrderIdNullWithIncludes.mockResolvedValue([
      wrap({
        id: 30,
        status: 'preparing',
        restaurantId: 7,
        employeeId: 22,
        dishId: 300,
        employee: { id: 22, name: 'Bob', user: { profileImage: 'b' } },
        dish: {
          id: 300,
          name: 'D',
          image: 'd',
          price: 20,
          restaurantId: 7,
        },
      }),
    ]);
    restaurantRepo.getById.mockResolvedValue({ id: 7, name: 'R2', userId: 80 });
    userRepo.getById.mockResolvedValue({ id: 80, profileImage: 'logo' });

    const result = await useCase.execute(1);
    expect(result).toHaveLength(2);
    const individual = result.find((r) => r.code === 'IO-30');
    expect(individual?.status).toBe('Pendente');
    expect(individual?.restaurant?.name).toBe('R2');
  });
});
