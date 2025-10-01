import { Module } from '@nestjs/common';

import { EmployeeController } from './controllers/employee.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { CreateEmployeeService } from 'src/application/use-cases/create-employee.use-cases';
import { DeleteEmployeeService } from 'src/application/use-cases/delete-employee.use-cases';
import { GetEmployeeByIdService } from 'src/application/use-cases/get-employee-byid.use-cases';
import { ListEmployeesService } from 'src/application/use-cases/list-employees.use-cases';
import { UpdateEmployeeService } from 'src/application/use-cases/update-employee.use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeController],
  providers: [
    ...employeeProvider,
    EmployeeRepository, 
    ListEmployeesService,
    GetEmployeeByIdService,
    CreateEmployeeService,
    UpdateEmployeeService,
    DeleteEmployeeService
  ],
  exports: [
    ListEmployeesService,
    GetEmployeeByIdService,
    CreateEmployeeService,
    UpdateEmployeeService,
    DeleteEmployeeService
  ]
})
export class EmployeeModule {}

