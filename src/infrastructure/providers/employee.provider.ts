import { EmployeeEntity } from "../database/entities/employee.entity";
import { UserEntity } from "../database/entities/user.entity";
import { EmployeeRepository } from '../database/repositories/employee.repository';

export const employeeProvider = [
  {
    provide: 'EMPLOYEE_ENTITY',
    useValue: EmployeeEntity,
  },
  {
    provide: 'USER_ENTITY',
    useValue: UserEntity,
  },
  {
    provide: 'EMPLOYEE_REPOSITORY',
    useClass: EmployeeRepository,
  },
];