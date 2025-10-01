import { Module } from '@nestjs/common';
import { CompanyController } from './controllers/company.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { companyProvider } from '../../infrastructure/providers/company.provider';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { userProvider } from 'src/infrastructure/providers/user.provider';
import { CreateCompanyService } from 'src/application/use-cases/create-company.use-cases';
import { DeleteCompanyService } from 'src/application/use-cases/delete-company.use-cases';
import { GetCompanyByIdService } from 'src/application/use-cases/get-company-byid.use-cases';
import { ListCompaniesService } from 'src/application/use-cases/list-companies.use-cases';
import { UpdateCompanyService } from 'src/application/use-cases/update-company.use-cases';
import { ListEmployeesByCompanyService } from 'src/application/use-cases/list-employees-by-company.use-cases';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { ListIndividualOrderByCompanyUseCase } from 'src/application/use-cases/list-individual-order-by-company.use-case';
import { individualOrderProvider } from 'src/infrastructure/providers/individual-order.provider';
import { IndividualOrderRepository } from 'src/infrastructure/database/repositories/individual-order.repository';
import { CreateCompanyOrderUseCase } from 'src/application/use-cases/create-company-order.use-case';
import { ListWeeklyOrdersByCompanyService } from 'src/application/use-cases/list-weekly-orders-by-company.use-cases';
import { CreateOrdersFromWeeklyOrdersUseCase } from 'src/application/use-cases/create-orders-from-weekly-orders.use-case';
import { employeeWeeklyOrdersProvider } from 'src/infrastructure/providers/employee-weekly-orders.provider';
import { EmployeeWeeklyOrdersRepository } from 'src/infrastructure/database/repositories/employee-weekly-orders.repository';
import { orderItemProvider } from 'src/infrastructure/providers/order-item.provider';
import { OrderItemRepository } from 'src/infrastructure/database/repositories/order-item.repository';
import { dishProvider } from 'src/infrastructure/providers/dish.provider';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';
import { companyOrderProvider } from 'src/infrastructure/providers/company-order.provider';
import { CompanyOrderRepository } from 'src/infrastructure/database/repositories/company-order.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyController],
  providers: [
    ...companyProvider,
    ...userProvider,
    ...employeeProvider,
    ...individualOrderProvider,
    ...employeeWeeklyOrdersProvider,
    ...orderItemProvider,
    ...dishProvider,
    ...companyOrderProvider,
    CompanyRepository,
    UserRepository,
    EmployeeRepository,
    IndividualOrderRepository,
    EmployeeWeeklyOrdersRepository,
    OrderItemRepository,
    DishRepository,
    CompanyOrderRepository,
    ListCompaniesService,
    GetCompanyByIdService, 
    CreateCompanyService, 
    UpdateCompanyService, 
    DeleteCompanyService,
    ListEmployeesByCompanyService,
    ListIndividualOrderByCompanyUseCase,
    CreateCompanyOrderUseCase,
    ListWeeklyOrdersByCompanyService,
    CreateOrdersFromWeeklyOrdersUseCase
  ],
  exports: [
    ListCompaniesService,
    GetCompanyByIdService,
    CreateCompanyService,
    UpdateCompanyService,
    DeleteCompanyService,
    ListEmployeesByCompanyService,
    ListIndividualOrderByCompanyUseCase,
    CreateCompanyOrderUseCase,
    ListWeeklyOrdersByCompanyService,
    CreateOrdersFromWeeklyOrdersUseCase
  ]
})
export class CompanyModule {}