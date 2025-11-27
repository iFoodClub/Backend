import { Module } from '@nestjs/common';
import { EmployeeWeeklyOrdersController } from './controllers/employee-weekly-orders.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { employeeWeeklyOrdersProvider } from 'src/infrastructure/providers/employee-weekly-orders.provider';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { individualOrderProvider } from 'src/infrastructure/providers/individual-order.provider';
import { orderItemProvider } from 'src/infrastructure/providers/order-item.provider';
import { dishProvider } from 'src/infrastructure/providers/dish.provider';
import { userProvider } from 'src/infrastructure/providers/user.provider';
import { CreateOrUpdateWeeklyOrderService } from 'src/application/use-cases/create-or-update-weekly-order.use-cases';
import { DeleteWeeklyOrderService } from 'src/application/use-cases/delete-weekly-order.use-cases';
import { GetWeeklyOrdersByEmployeeService } from 'src/application/use-cases/get-weekly-orders-by-employee.use-cases';
import { ListAllWeeklyOrdersService } from 'src/application/use-cases/list-all-weekly-orders.use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeWeeklyOrdersController],
  providers: [
    ...employeeWeeklyOrdersProvider,
    ...employeeProvider,
    ...individualOrderProvider,
    ...orderItemProvider,
    ...dishProvider,
    ...userProvider,
    CreateOrUpdateWeeklyOrderService,
    GetWeeklyOrdersByEmployeeService,
    DeleteWeeklyOrderService,
    ListAllWeeklyOrdersService,
  ],
  exports: [
    CreateOrUpdateWeeklyOrderService,
    GetWeeklyOrdersByEmployeeService,
    DeleteWeeklyOrderService,
    ListAllWeeklyOrdersService,
  ],
})
export class EmployeeWeeklyOrdersModule {}
