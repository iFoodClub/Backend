import { NotFoundException } from '@nestjs/common';
import { RestaurantController } from './restaurant.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';
import { IndividualOrderStatus } from '../../../domain/repositories/individual-order.repository.interface';
import { CompanyOrderStatus } from '../../../domain/repositories/company-order.repository.interface';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let listRestaurant: any;
  let getRestaurantById: any;
  let createRestaurant: any;
  let updateRestaurant: any;
  let deleteRestaurant: any;
  let listOrdersByRestaurant: any;
  let sendOrders: any;
  let createIndividualOrder: any;
  let updateIndividualOrderStatus: any;
  let updateCompanyOrderStatus: any;
  let getOrderProgress: any;
  let listFavorites: any;
  let toggleFavorite: any;

  beforeEach(() => {
    listRestaurant = { execute: jest.fn() };
    getRestaurantById = { execute: jest.fn() };
    createRestaurant = { execute: jest.fn() };
    updateRestaurant = { execute: jest.fn() };
    deleteRestaurant = { execute: jest.fn() };
    listOrdersByRestaurant = { execute: jest.fn() };
    sendOrders = { execute: jest.fn() };
    createIndividualOrder = { execute: jest.fn() };
    updateIndividualOrderStatus = { execute: jest.fn() };
    updateCompanyOrderStatus = { execute: jest.fn() };
    getOrderProgress = { execute: jest.fn() };
    listFavorites = { execute: jest.fn() };
    toggleFavorite = { execute: jest.fn() };

    controller = new RestaurantController(
      listRestaurant,
      getRestaurantById,
      createRestaurant,
      updateRestaurant,
      deleteRestaurant,
      listOrdersByRestaurant,
      sendOrders,
      createIndividualOrder,
      updateIndividualOrderStatus,
      updateCompanyOrderStatus,
      getOrderProgress,
      listFavorites,
      toggleFavorite,
    );
  });

  describe('list', () => {
    it('retorna a lista do service', async () => {
      listRestaurant.execute.mockResolvedValue([{ id: 1 }]);
      await expect(controller.list()).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    it('200 quando encontra', async () => {
      const res = mockResponse();
      getRestaurantById.execute.mockResolvedValue({ id: 1 });
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getRestaurantById.execute.mockResolvedValue(null);
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    const valid = {
      userId: 1,
      name: 'R',
      cnpj: '9',
      cep: '0',
      number: '1',
    } as any;

    it('400 quando faltam campos', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('cria e chama res.send()', async () => {
      const res = mockResponse();
      await controller.create(valid, res);
      expect(createRestaurant.execute).toHaveBeenCalledWith(valid);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('404 quando use-case retorna null', async () => {
      const res = mockResponse();
      updateRestaurant.execute.mockResolvedValue(null);
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 quando há campos inválidos', async () => {
      const res = mockResponse();
      updateRestaurant.execute.mockResolvedValue({ id: 1 });
      await controller.update('1', { foo: 'bar' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('200 quando atualiza', async () => {
      const res = mockResponse();
      updateRestaurant.execute.mockResolvedValue({ id: 1 });
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getRestaurantById.execute.mockResolvedValue(null);
      await controller.delete('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 quando deleta', async () => {
      const res = mockResponse();
      getRestaurantById.execute.mockResolvedValue({ id: 1 });
      await controller.delete('1', res);
      expect(deleteRestaurant.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('listOrders', () => {
    it('delega para listOrdersByRestaurantUseCase', async () => {
      listOrdersByRestaurant.execute.mockResolvedValue([{ id: 1 }]);
      await expect(controller.listOrders('5')).resolves.toEqual([{ id: 1 }]);
      expect(listOrdersByRestaurant.execute).toHaveBeenCalledWith(5);
    });
  });

  describe('createOrder', () => {
    it('400 quando restaurantId da URL e do body não batem', async () => {
      const res = mockResponse();
      await controller.createOrder('1', { restaurantId: 2 } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 em sucesso', async () => {
      const res = mockResponse();
      createIndividualOrder.execute.mockResolvedValue({
        message: 'Pedido criado com sucesso',
      });
      await controller.createOrder('1', { restaurantId: 1 } as any, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      createIndividualOrder.execute.mockRejectedValue(
        new NotFoundException('x'),
      );
      await controller.createOrder('1', { restaurantId: 1 } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro inesperado', async () => {
      const res = mockResponse();
      createIndividualOrder.execute.mockRejectedValue(new Error('boom'));
      await controller.createOrder('1', { restaurantId: 1 } as any, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateIndividualOrderStatus', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      updateIndividualOrderStatus.execute.mockResolvedValue({
        message: 'ok',
      });
      await controller.updateIndividualOrderStatus(
        '1',
        '2',
        '3',
        { status: IndividualOrderStatus.COMPLETED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      updateIndividualOrderStatus.execute.mockRejectedValue(
        new NotFoundException('x'),
      );
      await controller.updateIndividualOrderStatus(
        '1',
        '2',
        '3',
        { status: IndividualOrderStatus.COMPLETED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro inesperado', async () => {
      const res = mockResponse();
      updateIndividualOrderStatus.execute.mockRejectedValue(new Error('boom'));
      await controller.updateIndividualOrderStatus(
        '1',
        '2',
        '3',
        { status: IndividualOrderStatus.COMPLETED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateCompanyOrderStatus', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      updateCompanyOrderStatus.execute.mockResolvedValue({ message: 'ok' });
      await controller.updateCompanyOrderStatus(
        '1',
        '2',
        { status: CompanyOrderStatus.DELIVERED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      updateCompanyOrderStatus.execute.mockRejectedValue(
        new NotFoundException('x'),
      );
      await controller.updateCompanyOrderStatus(
        '1',
        '2',
        { status: CompanyOrderStatus.DELIVERED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro inesperado', async () => {
      const res = mockResponse();
      updateCompanyOrderStatus.execute.mockRejectedValue(new Error('boom'));
      await controller.updateCompanyOrderStatus(
        '1',
        '2',
        { status: CompanyOrderStatus.DELIVERED },
        res,
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOrderProgress', () => {
    it('200 em sucesso', async () => {
      const res = mockResponse();
      getOrderProgress.execute.mockResolvedValue({ progressPercentage: 50 });
      await controller.getOrderProgress('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 em NotFoundException', async () => {
      const res = mockResponse();
      getOrderProgress.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.getOrderProgress('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('500 em erro inesperado', async () => {
      const res = mockResponse();
      getOrderProgress.execute.mockRejectedValue(new Error('boom'));
      await controller.getOrderProgress('1', res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
