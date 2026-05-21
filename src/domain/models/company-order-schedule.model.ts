import { DayOfWeek } from '../repositories/employee-weekly-orders.repository.interface';

export interface CompanyOrderScheduleInterface {
  id: number;
  companyId: number;
  dayOfWeek: DayOfWeek;
  triggerTime: string; // HH:mm
  createdAt?: Date;
  updatedAt?: Date;
}
