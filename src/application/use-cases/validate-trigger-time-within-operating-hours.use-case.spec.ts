import { BadRequestException } from '@nestjs/common';
import { ValidateTriggerTimeWithinOperatingHoursUseCase } from './validate-trigger-time-within-operating-hours.use-case';

describe('ValidateTriggerTimeWithinOperatingHoursUseCase', () => {
  let useCase: ValidateTriggerTimeWithinOperatingHoursUseCase;

  beforeEach(() => {
    useCase = new ValidateTriggerTimeWithinOperatingHoursUseCase();
  });

  it('passa quando triggerTime está dentro do range', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '12:30',
        openingTime: '08:00',
        closingTime: '18:00',
      }),
    ).not.toThrow();
  });

  it('passa quando triggerTime é exatamente igual ao openingTime', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '08:00',
        openingTime: '08:00',
        closingTime: '18:00',
      }),
    ).not.toThrow();
  });

  it('passa quando triggerTime é exatamente igual ao closingTime', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '18:00',
        openingTime: '08:00',
        closingTime: '18:00',
      }),
    ).not.toThrow();
  });

  it('lança BadRequestException quando triggerTime está antes do openingTime', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '07:59',
        openingTime: '08:00',
        closingTime: '18:00',
        restaurantName: 'Casa do Sabor',
      }),
    ).toThrow(BadRequestException);
  });

  it('lança BadRequestException com mensagem clara quando fora do range', () => {
    try {
      useCase.execute({
        triggerTime: '22:00',
        openingTime: '08:00',
        closingTime: '18:00',
        restaurantName: 'Casa do Sabor',
      });
      fail('Era esperado lançar exceção');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const message = (error as BadRequestException).message;
      expect(message).toContain('22:00');
      expect(message).toContain('08:00');
      expect(message).toContain('18:00');
      expect(message).toContain('Casa do Sabor');
    }
  });

  it('lança BadRequestException quando o restaurante não tem horários configurados', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '12:00',
        openingTime: null,
        closingTime: '18:00',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      useCase.execute({
        triggerTime: '12:00',
        openingTime: '08:00',
        closingTime: null,
      }),
    ).toThrow(BadRequestException);
  });

  it('lança BadRequestException quando o triggerTime tem formato inválido', () => {
    expect(() =>
      useCase.execute({
        triggerTime: '25:00',
        openingTime: '08:00',
        closingTime: '18:00',
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      useCase.execute({
        triggerTime: '12-30',
        openingTime: '08:00',
        closingTime: '18:00',
      }),
    ).toThrow(BadRequestException);
  });

  describe('range que cruza meia-noite', () => {
    it('passa quando triggerTime está depois do openingTime (mesmo dia)', () => {
      expect(() =>
        useCase.execute({
          triggerTime: '23:30',
          openingTime: '22:00',
          closingTime: '02:00',
        }),
      ).not.toThrow();
    });

    it('passa quando triggerTime está antes do closingTime (madrugada)', () => {
      expect(() =>
        useCase.execute({
          triggerTime: '01:30',
          openingTime: '22:00',
          closingTime: '02:00',
        }),
      ).not.toThrow();
    });

    it('lança quando triggerTime está fora do overnight range', () => {
      expect(() =>
        useCase.execute({
          triggerTime: '12:00',
          openingTime: '22:00',
          closingTime: '02:00',
        }),
      ).toThrow(BadRequestException);
    });
  });
});
