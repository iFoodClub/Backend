import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserService } from '../../../application/use-cases/create-user.use-cases';
import { DeleteUserService } from '../../../application/use-cases/delete-user.use-cases';
import { GetUserByIdService } from '../../../application/use-cases/get-user-byid.use-cases';
import { ListUsersService } from '../../../application/use-cases/list-users.use-cases';
import { UpdateUserService } from '../../../application/use-cases/update-user.use-cases';
import { AuthService } from '../../../application/use-cases/login.use-cases';
import { GetUserByEmailService } from '../../../application/use-cases/get-byemail.use-cases';
import { mockResponse } from '../../../../test/helpers/http-mocks';

describe('UserController', () => {
  let controller: UserController;

  const createUserService = { execute: jest.fn() };
  const getUserByIdService = { execute: jest.fn() };
  const listUsersService = { execute: jest.fn() };
  const updateUserService = { execute: jest.fn() };
  const deleteUserService = { execute: jest.fn() };
  const authService = { login: jest.fn(), logout: jest.fn() };
  const getUserByEmailService = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserService, useValue: createUserService },
        { provide: GetUserByIdService, useValue: getUserByIdService },
        { provide: ListUsersService, useValue: listUsersService },
        { provide: UpdateUserService, useValue: updateUserService },
        { provide: DeleteUserService, useValue: deleteUserService },
        { provide: AuthService, useValue: authService },
        { provide: GetUserByEmailService, useValue: getUserByEmailService },
      ],
    }).compile();

    controller = moduleRef.get(UserController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('retorna a lista de usuários do use-case', async () => {
      const users = [{ id: 1, email: 'a@a.com' }];
      listUsersService.execute.mockResolvedValue(users);

      await expect(controller.list()).resolves.toBe(users);
      expect(listUsersService.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('delega para GetUserByIdService com o id recebido', async () => {
      const user = { id: 5, email: 'b@b.com' };
      getUserByIdService.execute.mockResolvedValue(user);

      await expect(controller.getById(5)).resolves.toBe(user);
      expect(getUserByIdService.execute).toHaveBeenCalledWith(5);
    });
  });

  describe('create (validações do body)', () => {
    it('retorna 400 quando faltam campos obrigatórios', async () => {
      const res = mockResponse();
      await controller.create({} as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('obrigatórios'),
        }),
      );
      expect(createUserService.execute).not.toHaveBeenCalled();
    });

    it('retorna 400 quando o userType é inválido', async () => {
      const res = mockResponse();
      await controller.create(
        {
          email: 'x@x.com',
          password: 'senha1234',
          userType: 'invalid',
          name: 'X',
          profileImage: 'img',
        } as any,
        res,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('userType inválido'),
        }),
      );
    });

    it('retorna 400 quando a senha tem menos que 8 caracteres', async () => {
      const res = mockResponse();
      await controller.create(
        {
          email: 'x@x.com',
          password: '123',
          userType: 'employee',
          name: 'X',
          profileImage: 'img',
        } as any,
        res,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('pelo menos 8'),
        }),
      );
    });

    it('cria usuário com sucesso (201) quando o payload é válido', async () => {
      const res = mockResponse();
      createUserService.execute.mockResolvedValue({ id: 1 });

      await controller.create(
        {
          email: 'x@x.com',
          password: 'senha1234',
          userType: 'employee',
          name: 'X',
          profileImage: 'img',
          cpf: '12345678901',
          employee: { birthDate: '2000-01-01' },
          company: { id: 1 },
        } as any,
        res,
      );

      expect(createUserService.execute).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('delega login para AuthService e retorna token/userDetails', async () => {
      authService.login.mockResolvedValue({
        token: 'jwt',
        userDetails: { id: 1 },
      });

      const result = await controller.login({
        email: 'a@a.com',
        password: 'senha1234',
      } as any);

      expect(authService.login).toHaveBeenCalledWith('a@a.com', 'senha1234');
      expect(result).toEqual({ token: 'jwt', userDetails: { id: 1 } });
    });
  });

  describe('delete', () => {
    it('delega para DeleteUserService com o id recebido', async () => {
      await controller.delete(7);
      expect(deleteUserService.execute).toHaveBeenCalledWith(7);
    });
  });

  describe('checkEmail', () => {
    it('retorna exists=true quando encontra usuário', async () => {
      getUserByEmailService.execute.mockResolvedValue({ id: 1 });
      await expect(controller.checkEmail('a@a.com')).resolves.toEqual({
        exists: true,
      });
    });

    it('retorna exists=false quando não encontra', async () => {
      getUserByEmailService.execute.mockResolvedValue(null);
      await expect(controller.checkEmail('a@a.com')).resolves.toEqual({
        exists: false,
      });
    });
  });
});
