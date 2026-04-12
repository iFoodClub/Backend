import { Inject, Injectable } from '@nestjs/common';
import { IEmployeePopulate } from '../../domain/models/employee.model';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';

@Injectable()
export class GetEmployeeByIdService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private employeeRepository: EmployeeRepository
  ) {}
  async execute(id: number): Promise<IEmployeePopulate | null> {
    return await this.employeeRepository.getById(id);
  }
}
