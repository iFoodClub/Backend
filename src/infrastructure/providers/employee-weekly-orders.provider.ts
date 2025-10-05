import { EmployeeWeeklyOrdersEntity } from "../database/entities/employee-weekly-orders.entity";
import { EmployeeWeeklyOrdersRepository } from "../database/repositories/employee-weekly-orders.repository";

export const employeeWeeklyOrdersProvider = [
  {
    provide: 'EMPLOYEE_WEEKLY_ORDERS_ENTITY',
    useValue: EmployeeWeeklyOrdersEntity,
  },
  {
    provide: 'EMPLOYEE_WEEKLY_ORDERS_REPOSITORY',
    useClass: EmployeeWeeklyOrdersRepository,
  },
];