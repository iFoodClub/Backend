import { DishController } from './dish.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('DishController', () => {
  let controller: DishController;
  let listDishes: any;
  let getDishById: any;
  let createDish: any;
  let updateDish: any;
  let deleteDish: any;
  let listDishesByRestaurant: any;
  let averageRatingByRestaurant: any;

  beforeEach(() => {
    listDishes = { execute: jest.fn() };
    getDishById = { execute: jest.fn() };
    createDish = { execute: jest.fn() };
    updateDish = { execute: jest.fn() };
    deleteDish = { execute: jest.fn() };
    listDishesByRestaurant = { execute: jest.fn() };
    averageRatingByRestaurant = { execute: jest.fn() };

    controller = new DishController(
      listDishes,
      getDishById,
      createDish,
      updateDish,
      deleteDish,
      listDishesByRestaurant,
      averageRatingByRestaurant,
    );
  });

  describe('list', () => {
    it('retorna a lista de pratos', async () => {
      listDishes.execute.mockResolvedValue([{ id: 1 }]);
      await expect(controller.list()).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    it('retorna 200 com o prato quando existe', async () => {
      const res = mockResponse();
      getDishById.execute.mockResolvedValue({ id: 1 });

      await controller.getById('1', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('retorna 404 quando não encontra', async () => {
      const res = mockResponse();
      getDishById.execute.mockResolvedValue(null);

      await controller.getById('1', res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    const valid = {
      restaurantId: 1,
      name: 'X',
      description: 'desc',
      price: 10,
      image: 'img',
    } as any;

    it('retorna 400 quando faltam campos', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(createDish.execute).not.toHaveBeenCalled();
    });

    it('retorna 201 quando cria com sucesso', async () => {
      const res = mockResponse();
      createDish.execute.mockResolvedValue({ id: 10 });

      await controller.create(valid, res);

      expect(createDish.execute).toHaveBeenCalledWith(valid);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 500 quando o service lança erro', async () => {
      const res = mockResponse();
      createDish.execute.mockRejectedValue(new Error('db down'));

      await controller.create(valid, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('update', () => {
    it('retorna 400 quando há campos inválidos', async () => {
      const res = mockResponse();
      updateDish.execute.mockResolvedValue({ id: 1 });

      await controller.update('1', { nope: 'x' } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 quando o use-case retorna null', async () => {
      const res = mockResponse();
      updateDish.execute.mockResolvedValue(null);

      await controller.update('1', { name: 'X' } as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com o prato atualizado', async () => {
      const res = mockResponse();
      updateDish.execute.mockResolvedValue({ id: 1, name: 'X' });

      await controller.update('1', { name: 'X' } as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'X' });
    });
  });

  describe('delete', () => {
    it('retorna 404 quando o prato não existe', async () => {
      const res = mockResponse();
      getDishById.execute.mockResolvedValue(null);

      await controller.delete('1', res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(deleteDish.execute).not.toHaveBeenCalled();
    });

    it('deleta o prato e retorna 200 quando existe', async () => {
      const res = mockResponse();
      getDishById.execute.mockResolvedValue({ id: 1 });

      await controller.delete('1', res);

      expect(deleteDish.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('listByRestaurant', () => {
    it('delega e responde 200', async () => {
      const res = mockResponse();
      listDishesByRestaurant.execute.mockResolvedValue([{ id: 1 }]);

      await controller.listByRestaurant('5', res);

      expect(listDishesByRestaurant.execute).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('averageRatingByRestaurant', () => {
    it('delega e responde 200', async () => {
      const res = mockResponse();
      averageRatingByRestaurant.execute.mockResolvedValue([]);

      await controller.averageRatingByRestaurant('5', res);

      expect(averageRatingByRestaurant.execute).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
