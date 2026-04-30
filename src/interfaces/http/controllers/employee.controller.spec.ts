import { EmployeeController } from './employee.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let listEmployees: any;
  let getById: any;
  let create: any;
  let update: any;
  let del: any;

  beforeEach(() => {
    listEmployees = { execute: jest.fn() };
    getById = { execute: jest.fn() };
    create = { execute: jest.fn() };
    update = { execute: jest.fn() };
    del = { execute: jest.fn() };
    controller = new EmployeeController(
      listEmployees,
      getById,
      create,
      update,
      del,
    );
  });

  describe('list', () => {
    it('retorna a lista', async () => {
      listEmployees.execute.mockResolvedValue([{ id: 1 }]);
      await expect(controller.list()).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    it('200 quando encontra', async () => {
      const res = mockResponse();
      getById.execute.mockResolvedValue({ id: 1 });
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getById.execute.mockResolvedValue(null);
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    it('400 em campos inválidos', async () => {
      const res = mockResponse();
      await controller.create({ foo: 'bar' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(create.execute).not.toHaveBeenCalled();
    });

    it('cria com sucesso e chama res.send', async () => {
      const res = mockResponse();
      await controller.create({ name: 'E', cpf: '123' } as any, res);
      expect(create.execute).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('404 quando use-case retorna null', async () => {
      const res = mockResponse();
      update.execute.mockResolvedValue(null);
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 quando há campos inválidos', async () => {
      const res = mockResponse();
      update.execute.mockResolvedValue({ id: 1 });
      await controller.update('1', { foo: 'bar' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('200 quando atualiza', async () => {
      const res = mockResponse();
      update.execute.mockResolvedValue({ id: 1, name: 'X' });
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('delete', () => {
    it('404 quando não encontra', async () => {
      const res = mockResponse();
      getById.execute.mockResolvedValue(null);
      await controller.delete('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 quando deleta', async () => {
      const res = mockResponse();
      getById.execute.mockResolvedValue({ id: 1 });
      await controller.delete('1', res);
      expect(del.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
