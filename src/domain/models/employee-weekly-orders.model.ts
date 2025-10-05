import { DayOfWeek } from "src/domain/repositories/employee-weekly-orders.repository.interface";

export interface EmployeeWeeklyOrderInterface {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek;
  orderItemId: number;
  createdAt?: Date;
  updatedAt?: Date;
} 