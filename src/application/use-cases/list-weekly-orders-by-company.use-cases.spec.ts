import { NotFoundException } from '@nestjs/common';
import { ListWeeklyOrdersByCompanyService } from './list-weekly-orders-by-company.use-cases';

describe('ListWeeklyOrdersByCompanyService', () => {
  let employeeRepo: any;
  let weeklyRepo: any;
  let orderItemRepo: any;
  let dishRepo: any;
  let companyRepo: any;
  let restaurantRepo: any;
  let userRepo: any;
  let service: ListWeeklyOrdersByCompanyService;

  beforeEach(() => {
    employeeRepo = {
      listByCompanyWithProfileImage: jest.fn(),
      listByCompany: jest.fn(),
    };
    weeklyRepo = { findByEmployeeAndDay: jest.fn() };
    orderItemRepo = { findByPk: jest.fn() };
    dishRepo = { getById: jest.fn() };
    companyRepo = { getById: jest.fn() };
    restaurantRepo = { getById: jest.fn() };
    userRepo = { getById: jest.fn() };

    service = new ListWeeklyOrdersByCompanyService(
      employeeRepo,
      weeklyRepo,
      orderItemRepo,
      dishRepo,
      companyRepo,
      restaurantRepo,
      userRepo,
    );
  });

  describe('execute', () => {
    it('lança NotFound quando empresa não existe', async () => {
      companyRepo.getById.mockResolvedValue(null);
      await expect(service.execute(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('retorna empresa e funcionários sem pedido quando não há weekly order', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompanyWithProfileImage.mockResolvedValue([
        { id: 10, name: 'Alice', profileImage: 'img' },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue(null);

      const result = await service.execute(1);
      expect(result.company).toEqual({ id: 1, name: 'Empr' });
      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].weeklyOrders[0].dish).toBeNull();
    });

    it('mapeia com prato quando orderItem e dish existem', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompanyWithProfileImage.mockResolvedValue([
        { id: 10, name: 'Alice', profileImage: null },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue({
        id: 50,
        employeeId: 10,
        dayOfWeek: 'Monday',
        orderItemId: 100,
      });
      orderItemRepo.findByPk.mockResolvedValue({ id: 100, dishId: 200 });
      dishRepo.getById.mockResolvedValue({
        id: 200,
        restaurantId: 5,
        name: 'P',
        description: 'd',
        price: 10,
        image: 'img',
      });

      const result = await service.execute(1);
      expect(result.employees[0].weeklyOrders[0].dish?.id).toBe(200);
    });

    it('retorna dish null quando dish não existe', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompanyWithProfileImage.mockResolvedValue([
        { id: 10, name: 'Alice' },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue({
        id: 50,
        employeeId: 10,
        dayOfWeek: 'Monday',
        orderItemId: 100,
      });
      orderItemRepo.findByPk.mockResolvedValue({ id: 100, dishId: 200 });
      dishRepo.getById.mockResolvedValue(null);

      const result = await service.execute(1);
      expect(result.employees[0].weeklyOrders[0].dish).toBeNull();
    });

    it('retorna order vazio quando orderItem sem dishId', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompanyWithProfileImage.mockResolvedValue([
        { id: 10, name: 'Alice' },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue({
        id: 50,
        employeeId: 10,
        dayOfWeek: 'Monday',
        orderItemId: 100,
      });
      orderItemRepo.findByPk.mockResolvedValue({ id: 100, dishId: null });

      const result = await service.execute(1);
      expect(result.employees[0].weeklyOrders[0].dish).toBeNull();
    });
  });

  describe('executeGroupedByRestaurant', () => {
    it('lança NotFound quando empresa não existe', async () => {
      companyRepo.getById.mockResolvedValue(null);
      await expect(
        service.executeGroupedByRestaurant(1),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('retorna estrutura agrupada quando há prato', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompany.mockResolvedValue([
        { id: 10, name: 'Alice', userId: 50 },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue({
        id: 70,
        orderItemId: 100,
      });
      orderItemRepo.findByPk.mockResolvedValue({ id: 100, dishId: 200 });
      dishRepo.getById.mockResolvedValue({
        id: 200,
        name: 'P',
        price: 10,
        image: 'img',
        restaurantId: 5,
      });
      restaurantRepo.getById.mockResolvedValue({
        id: 5,
        name: 'Rest',
        userId: 80,
      });
      userRepo.getById
        .mockResolvedValueOnce({ id: 50, profileImage: 'avatar' })
        .mockResolvedValueOnce({ id: 80, profileImage: 'logo' });

      const result = await service.executeGroupedByRestaurant(1);
      expect(result.restaurant).toEqual({
        id: 5,
        name: 'Rest',
        profileImage: 'logo',
      });
      expect(result.employees[0].order).toHaveLength(1);
    });

    it('retorna restaurant null quando não há pedidos', async () => {
      companyRepo.getById.mockResolvedValue({ id: 1, name: 'Empr' });
      employeeRepo.listByCompany.mockResolvedValue([
        { id: 10, name: 'Alice', userId: 50 },
      ]);
      weeklyRepo.findByEmployeeAndDay.mockResolvedValue(null);
      userRepo.getById.mockResolvedValue({ id: 50, profileImage: 'avatar' });

      const result = await service.executeGroupedByRestaurant(1);
      expect(result.restaurant).toBeNull();
      expect(result.employees[0].order).toHaveLength(0);
    });
  });
});
