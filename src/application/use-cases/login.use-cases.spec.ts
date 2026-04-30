import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './login.use-cases';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

describe('AuthService', () => {
  let getUserByEmailService: any;
  let companyRepo: any;
  let restaurantRepo: any;
  let employeeRepo: any;
  let jwtService: any;
  let service: AuthService;

  beforeEach(() => {
    getUserByEmailService = { execute: jest.fn() };
    companyRepo = { findByUserId: jest.fn() };
    restaurantRepo = { findByUserId: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    jwtService = { sign: jest.fn(), verify: jest.fn() };
    service = new AuthService(
      getUserByEmailService,
      companyRepo,
      restaurantRepo,
      employeeRepo,
      jwtService,
    );

    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();
    (bcrypt.genSalt as jest.Mock).mockReset();
  });

  describe('login', () => {
    it('lança UnauthorizedException quando o usuário não existe', async () => {
      getUserByEmailService.execute.mockResolvedValue(null);

      await expect(
        service.login('a@a.com', 'senha'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lança UnauthorizedException quando a senha é inválida', async () => {
      getUserByEmailService.execute.mockResolvedValue({
        id: 1,
        email: 'a@a.com',
        password: 'hash',
        userType: 'employee',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login('a@a.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('retorna token e userDetails para employee válido', async () => {
      getUserByEmailService.execute.mockResolvedValue({
        id: 1,
        email: 'e@e.com',
        password: 'hash',
        userType: 'employee',
        profileImage: 'img',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      employeeRepo.findByUserId.mockResolvedValue({
        id: 10,
        companyId: 50,
        name: 'Emp',
      });
      jwtService.sign.mockReturnValue('JWT');

      const result = await service.login('e@e.com', 'senha');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          email: 'e@e.com',
          userType: 'employee',
          employeeId: 10,
          companyId: 50,
        }),
      );
      expect(result.token).toBe('JWT');
      expect(result.userDetails).toMatchObject({
        id: 1,
        userType: 'employee',
        name: 'Emp',
      });
    });

    it('retorna token e userDetails para company válida', async () => {
      getUserByEmailService.execute.mockResolvedValue({
        id: 2,
        email: 'c@c.com',
        password: 'hash',
        userType: 'company',
        profileImage: 'img',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      companyRepo.findByUserId.mockResolvedValue({ id: 77, name: 'Co' });
      jwtService.sign.mockReturnValue('JWT');

      const result = await service.login('c@c.com', 'senha');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: 77, userType: 'company' }),
      );
      expect(result.userDetails.name).toBe('Co');
    });

    it('retorna token e userDetails para restaurant válido', async () => {
      getUserByEmailService.execute.mockResolvedValue({
        id: 3,
        email: 'r@r.com',
        password: 'hash',
        userType: 'restaurant',
        profileImage: 'img',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      restaurantRepo.findByUserId.mockResolvedValue({ id: 99, name: 'Rest' });
      jwtService.sign.mockReturnValue('JWT');

      const result = await service.login('r@r.com', 'senha');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ restaurantId: 99, userType: 'restaurant' }),
      );
      expect(result.userDetails.name).toBe('Rest');
    });
  });

  describe('validateToken', () => {
    it('retorna o sub quando o token é válido', async () => {
      jwtService.verify.mockReturnValue({ sub: 42 });

      await expect(service.validateToken('tok')).resolves.toBe(42);
    });

    it('lança UnauthorizedException quando o token é inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.validateToken('bad')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('não lança e não faz nada (JWT stateless)', () => {
      expect(() => service.logout('t')).not.toThrow();
    });
  });

  describe('hashPassword', () => {
    it('gera salt e hasheia a senha', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('SALT');
      (bcrypt.hash as jest.Mock).mockResolvedValue('HASHED');

      const hash = await service.hashPassword('plain');

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('plain', 'SALT');
      expect(hash).toBe('HASHED');
    });
  });
});
