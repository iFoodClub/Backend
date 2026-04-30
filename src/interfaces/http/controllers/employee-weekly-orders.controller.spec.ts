import { NotFoundException } from '@nestjs/common';
import { EmployeeWeeklyOrdersController } from './employee-weekly-orders.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('EmployeeWeeklyOrdersController', () => {
  let controller: EmployeeWeeklyOrdersController;
  let createOrUpdate: any;
  let getByEmployee: any;
  let del: any;
  let listAll: any;

  beforeEach(() => {
    createOrUpdate = { execute: jest.fn() };
    getByEmployee = { execute: jest.fn() };
    del = { execute: jest.fn() };
    listAll = { execute: jest.fn() };
    controller = new EmployeeWeeklyOrdersController(
      createOrUpdate,
      getByEmployee,
      del,
      listAll,
    );
  });

  describe('getAllWeeklyOrders', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      listAll.execute.mockResolvedValue([{ id: 1 }]);
      await controller.getAllWeeklyOrders(res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('500 em erro inesperado', async () => {
      const res = mockResponse();
      listAll.execute.mockRejectedValue(new Error('boom'));
      await controller.getAllWeeklyOrders(res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createOrUpdateWeeklyOrder', () => {
    it('201 em sucesso', async () => {
      const res = mockResponse();
      createOrUpdate.execute.mockResolvedValue({ id: 1 });
      await controller.createOrUpdateWeeklyOrder({} as any, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      createOrUpdate.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.createOrUpdateWeeklyOrder({} as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 em erro genérico', async () => {
      const res = mockResponse();
      createOrUpdate.execute.mockRejectedValue(new Error('boom'));
      await controller.createOrUpdateWeeklyOrder({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getWeeklyOrdersByEmployee', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      getByEmployee.execute.mockResolvedValue([]);
      await controller.getWeeklyOrdersByEmployee(1, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      getByEmployee.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.getWeeklyOrdersByEmployee(1, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro genérico', async () => {
      const res = mockResponse();
      getByEmployee.execute.mockRejectedValue(new Error('boom'));
      await controller.getWeeklyOrdersByEmployee(1, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteWeeklyOrder', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      await controller.deleteWeeklyOrder(1, res);
      expect(del.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      del.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.deleteWeeklyOrder(1, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro genérico', async () => {
      const res = mockResponse();
      del.execute.mockRejectedValue(new Error('boom'));
      await controller.deleteWeeklyOrder(1, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
