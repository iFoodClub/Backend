import { CompanyOrderScheduleEntity } from '../database/entities/company-order-schedule.entity';
import { CompanyOrderScheduleRepository } from '../database/repositories/company-order-schedule.repository';

export const companyOrderScheduleProvider = [
  {
    provide: 'COMPANY_ORDER_SCHEDULE_ENTITY',
    useValue: CompanyOrderScheduleEntity,
  },
  {
    provide: 'COMPANY_ORDER_SCHEDULE_REPOSITORY',
    useClass: CompanyOrderScheduleRepository,
  },
];
