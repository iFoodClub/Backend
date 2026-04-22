import { BadRequestException } from '@nestjs/common';
import { SqlInjectionGuard } from './sql-injection.guard';
import { mockExecutionContext } from '../../../test/helpers/http-mocks';

describe('SqlInjectionGuard', () => {
  const guard = new SqlInjectionGuard();

  const run = (request: Record<string, any>) =>
    guard.canActivate(mockExecutionContext(request));

  describe('entradas válidas', () => {
    it('permite body limpo', () => {
      expect(
        run({
          body: { name: 'João', city: 'São Paulo' },
          query: {},
          params: {},
        }),
      ).toBe(true);
    });

    it('permite emails válidos', () => {
      expect(
        run({
          body: { email: 'user@example.com' },
          query: {},
          params: {},
        }),
      ).toBe(true);
    });

    it('permite senhas com caracteres especiais comuns', () => {
      expect(
        run({
          body: { password: 'MyStr0ng!@#Pass' },
          query: {},
          params: {},
        }),
      ).toBe(true);
    });

    it('permite IDs numéricos em params', () => {
      expect(
        run({
          body: {},
          query: {},
          params: { id: '123', otherId: '456' },
        }),
      ).toBe(true);
    });

    it('permite arrays no body', () => {
      expect(
        run({
          body: { items: ['pizza', 'lasanha'] },
          query: {},
          params: {},
        }),
      ).toBe(true);
    });

    it('permite objetos aninhados no body', () => {
      expect(
        run({
          body: { user: { name: 'Ana', address: { city: 'Rio' } } },
          query: {},
          params: {},
        }),
      ).toBe(true);
    });
  });

  describe('tentativas de SQL injection', () => {
    it('bloqueia SELECT', () => {
      expect(() =>
        run({ body: { q: "SELECT * FROM users" }, query: {}, params: {} }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia UNION SELECT', () => {
      expect(() =>
        run({
          query: { q: "1 UNION SELECT password FROM users" },
          body: {},
          params: {},
        }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia DROP TABLE', () => {
      expect(() =>
        run({
          body: { q: 'DROP TABLE users' },
          query: {},
          params: {},
        }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia comentários SQL', () => {
      expect(() =>
        run({ body: { q: "admin'--" }, query: {}, params: {} }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia OR 1=1', () => {
      expect(() =>
        run({
          body: { q: "foo OR 1=1" },
          query: {},
          params: {},
        }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia params não-numéricos suspeitos', () => {
      expect(() =>
        run({
          body: {},
          query: {},
          params: { id: "1; DROP TABLE users" },
        }),
      ).toThrow(BadRequestException);
    });

    it('bloqueia caracteres de controle', () => {
      expect(() =>
        run({
          body: { q: 'abc\0def' },
          query: {},
          params: {},
        }),
      ).toThrow(BadRequestException);
    });
  });
});
