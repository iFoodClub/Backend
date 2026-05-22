import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { CompanyOrderScheduleRepository } from '../../infrastructure/database/repositories/company-order-schedule.repository';
import { CompanyOrderScheduleInterface } from '../../domain/models/company-order-schedule.model';

export interface CompanyOrderScheduleResult {
  companyId: number;
  restaurantOperatingHours: {
    restaurantId: number;
    openingTime: string | null;
    closingTime: string | null;
  } | null;
  schedule: CompanyOrderScheduleInterface[];
}

@Injectable()
export class GetCompanyOrderScheduleUseCase {
  constructor(
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('COMPANY_ORDER_SCHEDULE_REPOSITORY')
    private readonly scheduleRepository: CompanyOrderScheduleRepository,
  ) {}

  async execute(companyId: number): Promise<CompanyOrderScheduleResult> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    let restaurantOperatingHours: CompanyOrderScheduleResult['restaurantOperatingHours'] =
      null;

    if (company.restaurantId) {
      const restaurant = await this.restaurantRepository.getById(
        company.restaurantId,
      );
      if (restaurant) {
        restaurantOperatingHours = {
          restaurantId: restaurant.id,
          openingTime: restaurant.openingTime ?? null,
          closingTime: restaurant.closingTime ?? null,
        };
      }
    }

    const schedule = await this.scheduleRepository.findByCompany(companyId);

    return {
      companyId,
      restaurantOperatingHours,
      schedule,
    };
  }
}
