import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { UserController } from './controllers/user.controller';
import { userProvider } from 'src/infrastructure/providers/user.provider';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { companyProvider } from 'src/infrastructure/providers/company.provider';
import { restaurantProvider } from 'src/infrastructure/providers/restaurant.provider';
import { employeeWeeklyOrdersProvider } from 'src/infrastructure/providers/employee-weekly-orders.provider';
import { individualOrderProvider } from 'src/infrastructure/providers/individual-order.provider';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { EmployeeWeeklyOrdersRepository } from 'src/infrastructure/database/repositories/employee-weekly-orders.repository';
import { IndividualOrderRepository } from 'src/infrastructure/database/repositories/individual-order.repository';
import { AuthModule } from './auth.module';
import { CreateCompanyService } from 'src/application/use-cases/create-company.use-cases';
import { CreateEmployeeService } from 'src/application/use-cases/create-employee.use-cases';
import { CreateRestaurantService } from 'src/application/use-cases/create-restaurant.use-cases';
import { CreateUserService } from 'src/application/use-cases/create-user.use-cases';
import { DeleteUserService } from 'src/application/use-cases/delete-user.use-cases';
import { GetUserByEmailService } from 'src/application/use-cases/get-byemail.use-cases';
import { GetUserByIdService } from 'src/application/use-cases/get-user-byid.use-cases';
import { ListUsersService } from 'src/application/use-cases/list-users.use-cases';
import { AuthService } from 'src/application/use-cases/login.use-cases';
import { UpdateUserService } from 'src/application/use-cases/update-user.use-cases';
import { UserProfileEligibilityService } from 'src/application/use-cases/user-profile-eligibility.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [
    ...userProvider,
    ...employeeProvider,
    ...companyProvider,
    ...restaurantProvider,
    ...employeeWeeklyOrdersProvider,
    ...individualOrderProvider,
    UserRepository,
    EmployeeRepository,
    CompanyRepository,
    RestaurantRepository,
    EmployeeWeeklyOrdersRepository,
    IndividualOrderRepository,
    ListUsersService,
    GetUserByIdService,
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    GetUserByEmailService,
    AuthService,
    CreateEmployeeService,
    CreateCompanyService,
    CreateRestaurantService,
    UserProfileEligibilityService,
  ],
  exports: [
    ListUsersService,
    GetUserByIdService,
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    GetUserByEmailService,
    AuthService,
    CreateEmployeeService,
    CreateCompanyService,
    CreateRestaurantService,
  ],
})
export class UserModule {}
