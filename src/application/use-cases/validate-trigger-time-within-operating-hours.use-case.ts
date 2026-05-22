import { BadRequestException, Injectable } from '@nestjs/common';

/**
 * Valida que um horário de disparo (HH:mm) está dentro do range
 * de funcionamento de um restaurante (openingTime/closingTime em HH:mm).
 *
 * Suporta range que cruza meia-noite (ex.: opening=22:00, closing=02:00).
 *
 * Regras:
 * - Se opening ou closing estiverem vazios, lança erro (horários do
 *   restaurante não configurados).
 * - Se opening <= closing: trigger deve estar em [opening, closing].
 * - Se opening > closing (overnight): trigger deve estar em
 *   [opening, 23:59] ou [00:00, closing].
 */
@Injectable()
export class ValidateTriggerTimeWithinOperatingHoursUseCase {
  private readonly hhmmRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

  execute(params: {
    triggerTime: string;
    openingTime?: string | null;
    closingTime?: string | null;
    restaurantName?: string;
  }): void {
    const { triggerTime, openingTime, closingTime, restaurantName } = params;

    if (!openingTime || !closingTime) {
      throw new BadRequestException(
        `O restaurante${restaurantName ? ` "${restaurantName}"` : ''} ainda não possui horário de funcionamento cadastrado. Configure o horário antes de definir o disparo.`,
      );
    }

    if (
      !this.hhmmRegex.test(triggerTime) ||
      !this.hhmmRegex.test(openingTime) ||
      !this.hhmmRegex.test(closingTime)
    ) {
      throw new BadRequestException(
        'Horário inválido. Use o formato HH:mm (00:00 a 23:59).',
      );
    }

    const triggerMinutes = this.toMinutes(triggerTime);
    const openingMinutes = this.toMinutes(openingTime);
    const closingMinutes = this.toMinutes(closingTime);

    const insideRange = this.isWithinRange(
      triggerMinutes,
      openingMinutes,
      closingMinutes,
    );

    if (!insideRange) {
      throw new BadRequestException(
        `O horário de disparo ${triggerTime} está fora do horário de funcionamento do restaurante${restaurantName ? ` "${restaurantName}"` : ''} (${openingTime} - ${closingTime}). Escolha um horário dentro desse intervalo.`,
      );
    }
  }

  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map((n) => Number(n));
    return h * 60 + m;
  }

  private isWithinRange(
    triggerMinutes: number,
    openingMinutes: number,
    closingMinutes: number,
  ): boolean {
    if (openingMinutes === closingMinutes) {
      return triggerMinutes === openingMinutes;
    }
    if (openingMinutes < closingMinutes) {
      return (
        triggerMinutes >= openingMinutes && triggerMinutes <= closingMinutes
      );
    }
    return triggerMinutes >= openingMinutes || triggerMinutes <= closingMinutes;
  }
}
