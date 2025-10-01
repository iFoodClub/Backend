import { Module } from '@nestjs/common';
import { EmployeeWeeklyOrdersController } from './controllers/employee-weekly-orders.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { employeeWeeklyOrdersProvider } from 'src/infrastructure/providers/employee-weekly-orders.provider';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { individualOrderProvider } from 'src/infrastructure/providers/individual-order.provider';
import { orderItemProvider } from 'src/infrastructure/providers/order-item.provider';
import { CreateOrUpdateWeeklyOrderService } from 'src/application/use-cases/create-or-update-weekly-order.use-cases';
import { DeleteWeeklyOrderService } from 'src/application/use-cases/delete-weekly-order.use-cases';
import { GetWeeklyOrdersByEmployeeService } from 'src/application/use-cases/get-weekly-orders-by-employee.use-cases';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeWeeklyOrdersController],
  providers: [
    ...employeeWeeklyOrdersProvider,
    ...employeeProvider,
    ...individualOrderProvider,
    ...orderItemProvider,
    CreateOrUpdateWeeklyOrderService,
    GetWeeklyOrdersByEmployeeService,
    DeleteWeeklyOrderService,
  ],
  exports: [
    CreateOrUpdateWeeklyOrderService,
    GetWeeklyOrdersByEmployeeService,
    DeleteWeeklyOrderService,
  ]
})
export class EmployeeWeeklyOrdersModule {} 