import { CompanyOrderScheduleInterface } from '../models/company-order-schedule.model';
import { DayOfWeek } from './employee-weekly-orders.repository.interface';

export interface CompanyOrderScheduleRepositoryInterface {
  create(
    schedule: Omit<
      CompanyOrderScheduleInterface,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<CompanyOrderScheduleInterface>;

  update(
    id: number,
    schedule: Partial<Omit<CompanyOrderScheduleInterface, 'id'>>,
  ): Promise<CompanyOrderScheduleInterface>;

  findByCompany(companyId: number): Promise<CompanyOrderScheduleInterface[]>;

  findByCompanyAndDay(
    companyId: number,
    dayOfWeek: DayOfWeek,
  ): Promise<CompanyOrderScheduleInterface | null>;

  deleteByCompany(companyId: number): Promise<void>;

  bulkUpsert(
    companyId: number,
    items: Array<
      Pick<CompanyOrderScheduleInterface, 'dayOfWeek' | 'triggerTime'>
    >,
  ): Promise<CompanyOrderScheduleInterface[]>;
}
