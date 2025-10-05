import { Injectable, Inject } from '@nestjs/common';
import { EmployeeEntityInterface } from 'src/domain/repositories/employee.repository.interface';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';

@Injectable()
export class ListEmployeesService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository
  ) {}

  execute(): Promise<EmployeeEntityInterface[]> {
    return this.employeeRepository.list();
  }
}