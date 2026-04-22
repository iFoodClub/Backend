import { validateCNPJ } from './cnpj-validator';

describe('validateCNPJ', () => {
  describe('entradas inválidas (estrutura)', () => {
    it.each([
      ['string vazia', ''],
      ['menos de 14 dígitos', '1234567890'],
      ['mais de 14 dígitos', '123456789012345'],
      ['apenas letras', 'abcdefghijklmn'],
    ])('retorna false para %s', (_label, value) => {
      expect(validateCNPJ(value)).toBe(false);
    });

    it('retorna false quando todos os dígitos são iguais', () => {
      expect(validateCNPJ('00000000000000')).toBe(false);
      expect(validateCNPJ('11111111111111')).toBe(false);
      expect(validateCNPJ('99999999999999')).toBe(false);
    });
  });

  describe('entradas inválidas (dígitos verificadores)', () => {
    it('retorna false quando o primeiro DV está incorreto', () => {
      expect(validateCNPJ('11222333000100')).toBe(false);
    });

    it('retorna false quando o segundo DV está incorreto', () => {
      expect(validateCNPJ('11222333000182')).toBe(false);
    });
  });

  describe('entradas válidas', () => {
    it('retorna true para CNPJ válido sem máscara', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('retorna true para CNPJ válido com máscara', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('ignora caracteres não numéricos antes de validar', () => {
      expect(validateCNPJ('  11.222.333/0001-81  ')).toBe(true);
    });
  });
});
