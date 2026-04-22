import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('CompanyController', () => {
  let controller: CompanyController;
  let listCompanies: any;
  let getCompanyById: any;
  let createCompany: any;
  let updateCompany: any;
  let deleteCompany: any;
  let listEmployeesByCompany: any;
  let listIndividualOrderByCompany: any;
  let createCompanyOrder: any;
  let listWeeklyOrdersByCompany: any;
  let createOrdersFromWeekly: any;

  beforeEach(() => {
    listCompanies = { execute: jest.fn() };
    getCompanyById = { execute: jest.fn() };
    createCompany = { execute: jest.fn() };
    updateCompany = { execute: jest.fn() };
    deleteCompany = { execute: jest.fn() };
    listEmployeesByCompany = { execute: jest.fn() };
    listIndividualOrderByCompany = { execute: jest.fn() };
    createCompanyOrder = { execute: jest.fn() };
    listWeeklyOrdersByCompany = { executeGroupedByRestaurant: jest.fn() };
    createOrdersFromWeekly = { execute: jest.fn() };

    controller = new CompanyController(
      listCompanies,
      getCompanyById,
      createCompany,
      updateCompany,
      deleteCompany,
      listEmployeesByCompany,
      listIndividualOrderByCompany,
      createCompanyOrder,
      listWeeklyOrdersByCompany,
      createOrdersFromWeekly,
    );
  });

  describe('list', () => {
    it('retorna lista do service', async () => {
      listCompanies.execute.mockResolvedValue([{ id: 1 }]);
      await expect(controller.list()).resolves.toEqual([{ id: 1 }]);
    });
  });

  describe('getById', () => {
    it('retorna 200 com dados quando encontra', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 404 quando não encontra', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue(null);
      await controller.getById('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('create', () => {
    const valid = {
      userId: 1,
      name: 'N',
      cnpj: '111',
      cep: '0',
      number: '1',
    } as any;

    it('retorna 400 quando faltam campos', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(createCompany.execute).not.toHaveBeenCalled();
    });

    it('retorna 201 em caso de sucesso', async () => {
      const res = mockResponse();
      createCompany.execute.mockResolvedValue(undefined);
      await controller.create(valid, res);
      expect(createCompany.execute).toHaveBeenCalledWith(valid);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('retorna 400 com mensagem amigável quando BadRequestException', async () => {
      const res = mockResponse();
      createCompany.execute.mockRejectedValue(
        new BadRequestException('CNPJ já cadastrado'),
      );
      await controller.create(valid, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('CNPJ'),
        }),
      );
    });

    it('retorna 400 com mensagem amigável quando BadRequest com array de mensagens', async () => {
      const res = mockResponse();
      createCompany.execute.mockRejectedValue(
        new BadRequestException(['campo1 inválido', 'campo2 inválido']),
      );
      await controller.create(valid, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('campo1'),
        }),
      );
    });

    it('traduz conflito de chave primária (company_pkey) do Postgres', async () => {
      const res = mockResponse();
      const pgErr: any = new Error('duplicate key value ... company_pkey');
      pgErr.parent = { code: '23505', constraint: 'company_pkey' };
      createCompany.execute.mockRejectedValue(pgErr);
      await controller.create(valid, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('identificador'),
        }),
      );
    });

    it('traduz duplicidade genérica do Postgres', async () => {
      const res = mockResponse();
      const pgErr: any = new Error('duplicate');
      pgErr.parent = { code: '23505', constraint: 'unique_x' };
      createCompany.execute.mockRejectedValue(pgErr);
      await controller.create(valid, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('duplicado'),
        }),
      );
    });

    it('retorna mensagem do Error genérico', async () => {
      const res = mockResponse();
      createCompany.execute.mockRejectedValue(new Error('algum erro'));
      await controller.create(valid, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'algum erro' }),
      );
    });
  });

  describe('update', () => {
    it('retorna 400 para campos inválidos no body', async () => {
      const res = mockResponse();
      await controller.update('1', { foo: 'bar' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(updateCompany.execute).not.toHaveBeenCalled();
    });

    it('retorna 404 quando use-case retorna null', async () => {
      const res = mockResponse();
      updateCompany.execute.mockResolvedValue(null);
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 quando atualiza com sucesso', async () => {
      const res = mockResponse();
      updateCompany.execute.mockResolvedValue({ id: 1, name: 'X' });
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 400 quando o service lança', async () => {
      const res = mockResponse();
      updateCompany.execute.mockRejectedValue(new Error('boom'));
      await controller.update('1', { name: 'X' } as any, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('delete', () => {
    it('retorna 404 quando não existe', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue(null);
      await controller.delete('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(deleteCompany.execute).not.toHaveBeenCalled();
    });

    it('deleta e retorna 200', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      await controller.delete('1', res);
      expect(deleteCompany.execute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getEmployeesByCompany', () => {
    it('retorna 404 quando empresa não existe', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue(null);
      await controller.getEmployeesByCompany('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com a lista de funcionários', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      listEmployeesByCompany.execute.mockResolvedValue([{ id: 5 }]);
      await controller.getEmployeesByCompany('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 5 }]);
    });
  });

  describe('getOrdersByCompany', () => {
    it('responde 200 com os pedidos', async () => {
      const res = mockResponse();
      listIndividualOrderByCompany.execute.mockResolvedValue([{ id: 1 }]);
      await controller.getOrdersByCompany('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createOrder', () => {
    it('retorna 200 em sucesso', async () => {
      const res = mockResponse();
      createCompanyOrder.execute.mockResolvedValue({ id: 10 });
      await controller.createOrder('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 404 em NotFoundException', async () => {
      const res = mockResponse();
      createCompanyOrder.execute.mockRejectedValue(
        new NotFoundException('nope'),
      );
      await controller.createOrder('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 500 em erro inesperado', async () => {
      const res = mockResponse();
      createCompanyOrder.execute.mockRejectedValue(new Error('boom'));
      await controller.createOrder('1', res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getWeeklyOrdersByCompany', () => {
    it('retorna 404 quando empresa não existe', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue(null);
      await controller.getWeeklyOrdersByCompany('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 quando empresa existe', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      listWeeklyOrdersByCompany.executeGroupedByRestaurant.mockResolvedValue([]);
      await controller.getWeeklyOrdersByCompany('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createOrdersFromWeeklyOrders', () => {
    it('retorna 404 quando empresa não existe', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue(null);
      await controller.createOrdersFromWeeklyOrders('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 em sucesso', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      createOrdersFromWeekly.execute.mockResolvedValue({ created: 2 });
      await controller.createOrdersFromWeeklyOrders('1', res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 400 em BadRequestException', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      createOrdersFromWeekly.execute.mockRejectedValue(
        new BadRequestException('já existem pendentes'),
      );
      await controller.createOrdersFromWeeklyOrders('1', res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 em NotFoundException do use-case', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      createOrdersFromWeekly.execute.mockRejectedValue(
        new NotFoundException('nope'),
      );
      await controller.createOrdersFromWeeklyOrders('1', res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 500 em erro inesperado', async () => {
      const res = mockResponse();
      getCompanyById.execute.mockResolvedValue({ id: 1 });
      createOrdersFromWeekly.execute.mockRejectedValue(new Error('boom'));
      await controller.createOrdersFromWeeklyOrders('1', res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
