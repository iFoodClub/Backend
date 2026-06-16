import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { CompanyOrderScheduleRepository } from '../../infrastructure/database/repositories/company-order-schedule.repository';
import { CompanyOrderScheduleInterface } from '../../domain/models/company-order-schedule.model';
import { DayOfWeek } from '../../domain/repositories/employee-weekly-orders.repository.interface';
import { ValidateTriggerTimeWithinOperatingHoursUseCase } from './validate-trigger-time-within-operating-hours.use-case';

export interface SetCompanyOrderScheduleInput {
  schedule: Array<{ dayOfWeek: DayOfWeek; triggerTime: string }>;
}

@Injectable()
export class SetCompanyOrderScheduleUseCase {
  constructor(
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('COMPANY_ORDER_SCHEDULE_REPOSITORY')
    private readonly scheduleRepository: CompanyOrderScheduleRepository,
    private readonly validateTriggerTime: ValidateTriggerTimeWithinOperatingHoursUseCase,
  ) {}

  async execute(
    companyId: number,
    input: SetCompanyOrderScheduleInput,
  ): Promise<CompanyOrderScheduleInterface[]> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (!company.restaurantId) {
      throw new BadRequestException(
        'A empresa não possui um restaurante selecionado. Selecione o restaurante antes de configurar o horário de disparo.',
      );
    }

    const restaurant = await this.restaurantRepository.getById(
      company.restaurantId,
    );
    if (!restaurant) {
      throw new NotFoundException(
        'Restaurante selecionado pela empresa não encontrado',
      );
    }

    this.assertNoDuplicateDays(input.schedule);

    for (const item of input.schedule) {
      this.validateTriggerTime.execute({
        triggerTime: item.triggerTime,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
        restaurantName: restaurant.name,
      });
    }

    return this.scheduleRepository.bulkUpsert(companyId, input.schedule);
  }

  private assertNoDuplicateDays(
    schedule: Array<{ dayOfWeek: DayOfWeek; triggerTime: string }>,
  ): void {
    const seen = new Set<DayOfWeek>();
    for (const item of schedule) {
      if (seen.has(item.dayOfWeek)) {
        throw new BadRequestException(
          `O dia ${item.dayOfWeek} foi informado mais de uma vez.`,
        );
      }
      seen.add(item.dayOfWeek);
    }
  }
}
