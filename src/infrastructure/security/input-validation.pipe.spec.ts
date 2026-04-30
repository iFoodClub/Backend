import { BadRequestException } from '@nestjs/common';
import { InputValidationPipe } from './input-validation.pipe';

describe('InputValidationPipe', () => {
  const pipe = new InputValidationPipe();

  it('retorna valores não-string não-objeto sem alterar', () => {
    expect(pipe.transform(42)).toBe(42);
    expect(pipe.transform(null)).toBe(null);
    expect(pipe.transform(true)).toBe(true);
  });

  it('preserva email válido sem sanitização', () => {
    expect(pipe.transform('user@example.com')).toBe('user@example.com');
  });

  it('lança BadRequest para email com padrão SQL', () => {
    expect(() =>
      pipe.transform("user@example.com';DROP TABLE"),
    ).toThrow(BadRequestException);
  });

  it('preserva senha forte sem sanitizar', () => {
    expect(pipe.transform('MyStr0ng!@#Pass')).toBe('MyStr0ng!@#Pass');
  });

  it('remove caracteres de controle em strings comuns', () => {
    expect(pipe.transform('abc\ndef')).toBe('abcdef');
  });

  it('bloqueia string com SELECT', () => {
    expect(() => pipe.transform('SELECT * FROM users')).toThrow(
      BadRequestException,
    );
  });

  it('bloqueia comentário SQL', () => {
    expect(() => pipe.transform("admin'--")).toThrow(BadRequestException);
  });

  it('sanitiza objetos mas preserva campos sensíveis', () => {
    const input = {
      email: 'u@u.com',
      password: 'Senha@1234',
      name: 'João',
      city: 'São Paulo',
    };
    const result = pipe.transform(input);
    expect(result.email).toBe('u@u.com');
    expect(result.password).toBe('Senha@1234');
    expect(result.name).toBe('João');
    expect(result.city).toBe('São Paulo');
  });

  it('aplica transform recursivamente em sub-objetos (employee/company/restaurant)', () => {
    const input = {
      company: { note: 'valor\nnormal' },
    };
    const result = pipe.transform(input);
    expect(result.company.note).toBe('valornormal');
  });

  it('lança erro quando sub-objeto contém SQL', () => {
    expect(() =>
      pipe.transform({ address: 'rua UNION SELECT senha' }),
    ).toThrow(BadRequestException);
  });
});
