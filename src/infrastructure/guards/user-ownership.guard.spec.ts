import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserOwnershipGuard } from './user-ownership.guard';
import { UserType } from '../../domain/models/user.model';
import { mockExecutionContext } from '../../../test/helpers/http-mocks';

describe('UserOwnershipGuard', () => {
  let guard: UserOwnershipGuard;

  beforeEach(() => {
    guard = new UserOwnershipGuard();
  });

  it('libera acesso quando o usuário autenticado é o dono do recurso', () => {
    const ctx = mockExecutionContext({
      user: { id: 42, email: 'a@a.com', userType: UserType.EMPLOYEE },
      params: { id: '42' },
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lança UnauthorizedException quando não há usuário na requisição', () => {
    const ctx = mockExecutionContext({
      user: undefined,
      params: { id: '1' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lança ForbiddenException quando o id não é fornecido', () => {
    const ctx = mockExecutionContext({
      user: { id: 1, email: 'a@a.com', userType: UserType.EMPLOYEE },
      params: {},
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow(/ID do usuário não fornecido/);
  });

  it('lança ForbiddenException quando o usuário tenta acessar outro perfil', () => {
    const ctx = mockExecutionContext({
      user: { id: 1, email: 'a@a.com', userType: UserType.EMPLOYEE },
      params: { id: '2' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow(
      /Você só pode modificar seu próprio perfil/,
    );
  });
});
