import { NotFoundException } from '@nestjs/common';
import { DishRatingControlller } from './dish-rating.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('DishRatingControlller', () => {
  let controller: DishRatingControlller;
  let getListByDish: any;
  let createDishRating: any;
  let getByDishAndUser: any;
  let updateDishRating: any;
  let deleteDishRating: any;

  beforeEach(() => {
    getListByDish = { execute: jest.fn() };
    createDishRating = { execute: jest.fn() };
    getByDishAndUser = { execute: jest.fn() };
    updateDishRating = { execute: jest.fn() };
    deleteDishRating = { execute: jest.fn() };
    controller = new DishRatingControlller(
      getListByDish,
      createDishRating,
      getByDishAndUser,
      updateDishRating,
      deleteDishRating,
    );
  });

  describe('listByDish', () => {
    it('200 quando encontra avaliações', async () => {
      const res = mockResponse();
      getListByDish.execute.mockResolvedValue({ rating: 4 });
      await controller.listByDish('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getListByDish.execute.mockResolvedValue(null);
      await controller.listByDish('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getRatingByDishAndUser', () => {
    it('200 quando encontra', async () => {
      const res = mockResponse();
      getByDishAndUser.execute.mockResolvedValue({ id: 1 });
      await controller.getRatingByDishAndUser('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getByDishAndUser.execute.mockResolvedValue(null);
      await controller.getRatingByDishAndUser('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('400 quando faltam campos', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 para rating fora de 1-5', async () => {
      const res = mockResponse();
      await controller.create(
        { dishId: 1, userId: 1, rating: 10 } as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 para rating não-inteiro', async () => {
      const res = mockResponse();
      await controller.create(
        { dishId: 1, userId: 1, rating: 2.5 } as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 quando válido', async () => {
      const res = mockResponse();
      createDishRating.execute.mockResolvedValue({ id: 10 });
      await controller.create(
        { dishId: 1, userId: 2, rating: 4, description: 'bom' } as any,
        res,
      );
      expect(createDishRating.execute).toHaveBeenCalledWith({
        dishId: 1,
        userId: 2,
        rating: 4,
        description: 'bom',
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('404 quando use-case lança NotFoundException', async () => {
      const res = mockResponse();
      createDishRating.execute.mockRejectedValue(new NotFoundException('x'));
      await controller.create(
        { dishId: 1, userId: 2, rating: 4 } as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('propaga erros não-NotFound', async () => {
      const res = mockResponse();
      createDishRating.execute.mockRejectedValue(new Error('boom'));
      await expect(
        controller.create({ dishId: 1, userId: 2, rating: 4 } as any, res),
      ).rejects.toThrow('boom');
    });
  });

  describe('update', () => {
    it('400 para campos inválidos', async () => {
      const res = mockResponse();
      updateDishRating.execute.mockResolvedValue({ id: 1 });
      await controller.update('1', { nope: 'x' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 quando use-case retorna null', async () => {
      const res = mockResponse();
      updateDishRating.execute.mockResolvedValue(null);
      await controller.update('1', { rating: 4 } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 quando atualiza', async () => {
      const res = mockResponse();
      updateDishRating.execute.mockResolvedValue({ id: 1, rating: 4 });
      await controller.update('1', { rating: 4 } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('204 em sucesso', async () => {
      const res = mockResponse();
      await controller.delete('1', res);
      expect(deleteDishRating.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('400 em erro', async () => {
      const res = mockResponse();
      deleteDishRating.execute.mockRejectedValue(new Error('x'));
      await controller.delete('1', res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
