import { Injectable, Inject } from '@nestjs/common';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { IEmployeePopulate } from 'src/domain/models/employee.model';

@Injectable()
export class ListEmployeesService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository
  ) {}

  execute(): Promise<IEmployeePopulate[]> {
    return this.employeeRepository.list();
  }
}