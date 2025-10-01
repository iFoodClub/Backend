import { Inject, Injectable } from '@nestjs/common';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';

@Injectable()
export class DeleteEmployeeService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository
  ) {}
  async execute(id: number): Promise<void> {
    await this.employeeRepository.delete(id);
  }
}