import { NotFoundException } from '@nestjs/common';
import { ListOrdersByRestaurantUseCase } from './list-orders-by-restaurant.use-case';

describe('ListOrdersByRestaurantUseCase', () => {
  let companyOrderRepo: any;
  let employeeRepo: any;
  let companyRepo: any;
  let userRepo: any;
  let useCase: ListOrdersByRestaurantUseCase;

  beforeEach(() => {
    companyOrderRepo = { findOrdersByRestaurant: jest.fn() };
    employeeRepo = { getById: jest.fn() };
    companyRepo = { getById: jest.fn() };
    userRepo = { getById: jest.fn() };
    useCase = new ListOrdersByRestaurantUseCase(
      companyOrderRepo,
      employeeRepo,
      companyRepo,
      userRepo,
    );
  });

  it('lança NotFound quando não há pedidos', async () => {
    companyOrderRepo.findOrdersByRestaurant.mockResolvedValue([]);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('mapeia pedidos e calcula total com price string/number', async () => {
    const empOrder1 = {
      employee: { id: 10, name: 'Alice', user: { profileImage: 'img' } },
      get: () => ({
        id: 100,
        status: 'preparing',
        dish: {
          id: 200,
          name: 'Pizza',
          image: 'p',
          price: '12.50',
          restaurantId: 5,
        },
      }),
    };
    const empOrder2 = {
      employee: { id: 11, name: null, user: null },
      get: () => ({
        id: 101,
        status: 'completed',
        dish: { id: 201, name: 'Y', image: '', price: 7, restaurantId: 5 },
      }),
    };
    const order = {
      collaboratorsOrders: [empOrder1, empOrder2],
      get: () => ({
        id: 1,
        status: 'pending',
        restaurantId: 5,
        company: { id: 50 },
        collaboratorsOrders: [
          {
            dish: { price: '12.50' },
          },
          {
            dish: { price: 7 },
          },
        ],
      }),
    };

    companyOrderRepo.findOrdersByRestaurant.mockResolvedValue([order]);
    companyRepo.getById.mockResolvedValue({ id: 50, name: 'Empr', userId: 80 });
    userRepo.getById.mockResolvedValue({ id: 80, profileImage: 'logo' });
    employeeRepo.getById.mockResolvedValue({
      id: 11,
      name: 'Bob',
      userId: 90,
    });

    const result = await useCase.execute(5);
    expect(result).toHaveLength(1);
    expect(result[0].totalPrice).toBeCloseTo(19.5);
    expect(result[0].status).toBe('Enviado');
    expect(result[0].code).toBe('FC-1');
    expect(result[0].employeeOrders).toHaveLength(2);
  });
});
