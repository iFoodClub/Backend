/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ForbiddenException } from '@nestjs/common';
import { UploadAuthorizationGuard } from './upload-authorization.guard';
import { mockExecutionContext } from '../../../test/helpers/http-mocks';
import { UserType } from '../../domain/models/user.model';

describe('UploadAuthorizationGuard', () => {
  const guard = new UploadAuthorizationGuard();

  const makeCtx = (
    user: any,
    url: string = '',
    params: Record<string, any> = {},
  ) =>
    mockExecutionContext({
      user,
      url,
      params,
    });

  it('lança ForbiddenException quando não há usuário autenticado', () => {
    expect(() => guard.canActivate(makeCtx(null))).toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando usuário não tem userType', () => {
    expect(() => guard.canActivate(makeCtx({ id: 1 }))).toThrow(
      ForbiddenException,
    );
  });

  it('permite quando não há folder nem URL reconhecida', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY },
      '/something/else',
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('COMPANY pode acessar folder companies', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.COMPANY }, '/company/1');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('COMPANY pode acessar folder users (funcionários)', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.COMPANY }, '/employee/1');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('COMPANY não pode acessar dishes', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.COMPANY }, '/Dish/1');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('RESTAURANT pode acessar restaurants', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.RESTAURANT },
      '/restaurant/1',
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('RESTAURANT pode acessar dishes (case-insensitive)', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.RESTAURANT }, '/Dish/1');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('RESTAURANT não pode acessar companies', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.RESTAURANT }, '/company/1');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('EMPLOYEE pode acessar users', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.EMPLOYEE }, '/employee/1');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('EMPLOYEE não pode acessar companies', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.EMPLOYEE }, '/company/1');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('usa folder do params quando presente, ignorando URL', () => {
    const ctx = makeCtx({ id: 1, userType: UserType.COMPANY }, '/something', {
      folder: 'companies',
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloqueia userType desconhecido', () => {
    const ctx = makeCtx({ id: 1, userType: 'alien' }, '/company/1');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
