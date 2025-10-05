import { Module } from '@nestjs/common';
import { DishRepository } from './repositories/dish.repository';
import { databaseProvider } from '../providers/database.provider';
import { dishProvider } from '../providers/dish.provider';
import { employeeProvider } from '../providers/employee.provider';
import { EmployeeRepository } from './repositories/employee.repository';
import { CompanyRepository } from './repositories/company.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { companyProvider } from '../providers/company.provider';
import { restaurantProvider } from '../providers/restaurant.provider';
import { UserRepository } from './repositories/user.repository';
import { userProvider } from '../providers/user.provider';
import { employeeWeeklyOrdersProvider } from '../providers/employee-weekly-orders.provider';
import { companyOrderProvider } from '../providers/company-order.provider';

@Module({
    providers:[
        CompanyRepository, 
        DishRepository, 
        EmployeeRepository, 
        RestaurantRepository, 
        UserRepository,
        ...companyProvider, 
        ...databaseProvider, 
        ...dishProvider, 
        ...employeeProvider, 
        ...restaurantProvider,
        ...userProvider,
        ...employeeWeeklyOrdersProvider,
        ...companyOrderProvider
    ],
    exports:[
        CompanyRepository, 
        DishRepository, 
        EmployeeRepository, 
        RestaurantRepository,
        UserRepository,
        ...companyProvider, 
        ...databaseProvider, 
        ...dishProvider, 
        ...employeeProvider, 
        ...restaurantProvider,
        ...userProvider,
        ...employeeWeeklyOrdersProvider,
        ...companyOrderProvider
    ]
})
export class DatabaseModule {}