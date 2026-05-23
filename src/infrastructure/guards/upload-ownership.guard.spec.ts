/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UploadOwnershipGuard } from './upload-ownership.guard';
import { mockExecutionContext } from '../../../test/helpers/http-mocks';
import { UserType } from '../../domain/models/user.model';

describe('UploadOwnershipGuard', () => {
  let companyRepo: any;
  let employeeRepo: any;
  let restaurantRepo: any;
  let dishRepo: any;
  let guard: UploadOwnershipGuard;

  beforeEach(() => {
    companyRepo = { getById: jest.fn() };
    employeeRepo = {
      getById: jest.fn(),
      listByCompanyWithProfileImage: jest.fn(),
      getByUserId: jest.fn(),
    };
    restaurantRepo = { getById: jest.fn() };
    dishRepo = { getById: jest.fn(), listByRestaurant: jest.fn() };
    guard = new UploadOwnershipGuard(
      companyRepo,
      employeeRepo,
      restaurantRepo,
      dishRepo,
    );
  });

  const makeCtx = (
    user: any,
    opts: {
      url?: string;
      method?: string;
      params?: Record<string, any>;
      body?: Record<string, any>;
    } = {},
  ) =>
    mockExecutionContext({
      user,
      url: opts.url ?? '/',
      method: opts.method ?? 'GET',
      params: opts.params ?? {},
      body: opts.body ?? {},
    });

  it('lança ForbiddenException quando não há usuário', async () => {
    await expect(guard.canActivate(makeCtx(null))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('permite POST genérico quando não há id nem key', async () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY, companyId: 1 },
      { url: '/something', method: 'POST' },
    );
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  describe('validateUpdateOwnership - COMPANY', () => {
    it('permite empresa atualizar sua própria empresa', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { url: '/company/10', method: 'PUT', params: { id: '10' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('bloqueia empresa tentando atualizar outra empresa', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { url: '/company/20', method: 'PUT', params: { id: '20' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('permite empresa atualizar funcionário da própria empresa', async () => {
      employeeRepo.getById.mockResolvedValue({
        id: 5,
        company: { id: 10 },
      });
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { url: '/employee/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('lança NotFoundException quando funcionário não existe', async () => {
      employeeRepo.getById.mockResolvedValue(null);
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { url: '/employee/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('bloqueia empresa tentando alterar funcionário de outra', async () => {
      employeeRepo.getById.mockResolvedValue({
        id: 5,
        company: { id: 99 },
      });
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { url: '/employee/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('validateUpdateOwnership - RESTAURANT', () => {
    it('permite restaurante atualizar seu próprio restaurante', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { url: '/restaurant/10', method: 'PUT', params: { id: '10' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('bloqueia restaurante tentando alterar outro', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { url: '/restaurant/20', method: 'PUT', params: { id: '20' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('permite restaurante atualizar prato próprio', async () => {
      dishRepo.getById.mockResolvedValue({ id: 5, restaurantId: 10 });
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { url: '/Dish/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('bloqueia quando o prato pertence a outro restaurante', async () => {
      dishRepo.getById.mockResolvedValue({ id: 5, restaurantId: 99 });
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { url: '/Dish/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('bloqueia quando o restaurantId está ausente no token', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT },
        { url: '/Dish/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('lança NotFoundException quando o prato não existe', async () => {
      dishRepo.getById.mockResolvedValue(null);
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { url: '/Dish/5', method: 'PUT', params: { id: '5' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('validateUpdateOwnership - EMPLOYEE', () => {
    it('permite funcionário atualizar seu próprio perfil', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.EMPLOYEE, employeeId: 7 },
        { url: '/employee/7', method: 'PUT', params: { id: '7' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('bloqueia funcionário tentando alterar outro perfil', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.EMPLOYEE, employeeId: 7 },
        { url: '/employee/99', method: 'PUT', params: { id: '99' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('validateDeleteOwnership (key no body)', () => {
    it('COMPANY deletando logo da própria empresa', async () => {
      companyRepo.getById.mockResolvedValue({
        id: 10,
        profileImage: 'https://s3/companies/10.jpg',
      });
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { method: 'DELETE', body: { key: 'companies/10.jpg' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('COMPANY bloqueada ao deletar imagem que não é sua', async () => {
      companyRepo.getById.mockResolvedValue({
        id: 10,
        profileImage: 'https://s3/companies/10.jpg',
      });
      const ctx = makeCtx(
        { id: 1, userType: UserType.COMPANY, companyId: 10 },
        { method: 'DELETE', body: { key: 'companies/99.jpg' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('RESTAURANT deletando prato próprio via key', async () => {
      dishRepo.listByRestaurant.mockResolvedValue([
        { id: 5, image: 'https://s3/dishes/5.jpg' },
      ]);
      const ctx = makeCtx(
        { id: 1, userType: UserType.RESTAURANT, restaurantId: 10 },
        { method: 'DELETE', body: { key: 'dishes/5.jpg' } },
      );
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('folder não suportado para o userType lança Forbidden', async () => {
      const ctx = makeCtx(
        { id: 1, userType: UserType.EMPLOYEE, employeeId: 7 },
        { method: 'DELETE', body: { key: 'companies/10.jpg' } },
      );
      await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
