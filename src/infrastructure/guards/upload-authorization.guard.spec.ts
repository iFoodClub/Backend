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

  it('COMPANY pode acessar folder perfis', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY },
      '/upload/image/perfis',
      { folder: 'perfis' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('COMPANY pode acessar folder funcionarios', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY },
      '/upload/image/funcionarios',
      { folder: 'funcionarios' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('COMPANY não pode acessar pratos', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY },
      '/upload/image/pratos',
      { folder: 'pratos' },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('RESTAURANT pode acessar perfis', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.RESTAURANT },
      '/upload/image/perfis',
      { folder: 'perfis' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('RESTAURANT pode acessar pratos', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.RESTAURANT },
      '/upload/image/pratos',
      { folder: 'pratos' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('RESTAURANT não pode acessar funcionarios', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.RESTAURANT },
      '/upload/image/funcionarios',
      { folder: 'funcionarios' },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('EMPLOYEE pode acessar funcionarios', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.EMPLOYEE },
      '/upload/image/funcionarios',
      { folder: 'funcionarios' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('EMPLOYEE não pode acessar pratos', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.EMPLOYEE },
      '/upload/image/pratos',
      { folder: 'pratos' },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('usa folder do params quando presente, ignorando URL', () => {
    const ctx = makeCtx(
      { id: 1, userType: UserType.COMPANY },
      '/something',
      { folder: 'perfis' },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloqueia userType desconhecido', () => {
    const ctx = makeCtx(
      { id: 1, userType: 'alien' },
      '/company/1',
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
