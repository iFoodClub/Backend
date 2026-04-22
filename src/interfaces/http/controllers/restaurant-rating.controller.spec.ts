import { NotFoundException } from '@nestjs/common';
import { RestaurantRatingController } from './restaurant-rating.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('RestaurantRatingController', () => {
  let controller: RestaurantRatingController;
  let getListByRestaurant: any;
  let createRating: any;
  let getByRestaurantAndUser: any;
  let updateRating: any;
  let deleteRating: any;

  beforeEach(() => {
    getListByRestaurant = { execute: jest.fn() };
    createRating = { execute: jest.fn() };
    getByRestaurantAndUser = { execute: jest.fn() };
    updateRating = { execute: jest.fn() };
    deleteRating = { execute: jest.fn() };
    controller = new RestaurantRatingController(
      getListByRestaurant,
      createRating,
      getByRestaurantAndUser,
      updateRating,
      deleteRating,
    );
  });

  describe('listByRestaurant', () => {
    it('200 quando encontra', async () => {
      const res = mockResponse();
      getListByRestaurant.execute.mockResolvedValue([{ id: 1 }]);
      await controller.listByRestaurant('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getListByRestaurant.execute.mockResolvedValue(null);
      await controller.listByRestaurant('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getRatingByRestaurantAndUser', () => {
    it('200 quando encontra', async () => {
      const res = mockResponse();
      getByRestaurantAndUser.execute.mockResolvedValue([{ id: 1 }]);
      await controller.getRatingByRestaurantAndUser('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getByRestaurantAndUser.execute.mockResolvedValue(null);
      await controller.getRatingByRestaurantAndUser('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    const valid = {
      restaurantId: 1,
      userId: 2,
      rating: 4,
      description: 'bom',
    } as any;

    it('400 quando faltam campos', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 quando rating fora de 1-5', async () => {
      const res = mockResponse();
      await controller.create({ ...valid, rating: 9 }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 quando descrição vazia', async () => {
      const res = mockResponse();
      await controller.create({ ...valid, description: '   ' }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 quando válido', async () => {
      const res = mockResponse();
      await controller.create(valid, res);
      expect(createRating.execute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('404 quando use-case lança NotFoundException', async () => {
      const res = mockResponse();
      createRating.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.create(valid, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('propaga erro inesperado', async () => {
      const res = mockResponse();
      createRating.execute.mockRejectedValue(new Error('boom'));
      await expect(controller.create(valid, res)).rejects.toThrow('boom');
    });
  });

  describe('update', () => {
    it('400 para campos inválidos', async () => {
      const res = mockResponse();
      await controller.update('1', { foo: 'bar' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(updateRating.execute).not.toHaveBeenCalled();
    });

    it('404 quando use-case retorna null', async () => {
      const res = mockResponse();
      updateRating.execute.mockResolvedValue(null);
      await controller.update('1', { rating: 4 } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 quando atualiza', async () => {
      const res = mockResponse();
      updateRating.execute.mockResolvedValue({ id: 1 });
      await controller.update('1', { rating: 4 } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('204 em sucesso', async () => {
      const res = mockResponse();
      await controller.delete('1', res);
      expect(deleteRating.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('400 em erro', async () => {
      const res = mockResponse();
      deleteRating.execute.mockRejectedValue(new Error('x'));
      await controller.delete('1', res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
