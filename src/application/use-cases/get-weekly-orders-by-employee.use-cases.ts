import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeWeeklyOrderResponse } from 'src/interfaces/http/dtos/response/employeeWeeklyOrder.dto';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { OrderItemRepository } from 'src/infrastructure/database/repositories/order-item.repository';
import { EmployeeWeeklyOrdersEntityInterface } from 'src/domain/repositories/employee-weekly-orders.repository.interface';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';

@Injectable()
export class GetWeeklyOrdersByEmployeeService {
  constructor(
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: OrderItemRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
  ) {}

  async execute(employeeId: number): Promise<EmployeeWeeklyOrderResponse[]> {
    const employee = await this.employeeRepository.getById(employeeId);
    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const employeeWeeklyOrders = await this.employeeWeeklyOrdersRepository.findByEmployeeId(employeeId);
    const result: EmployeeWeeklyOrdersEntityInterface[] = [];
    for (const employeeWeeklyOrder of employeeWeeklyOrders) {
      const orderItems = await this.orderItemRepository.findByPk(employeeWeeklyOrder.orderItemId);
      employeeWeeklyOrder.order = orderItems;
      if (orderItems.dishId) {
        const dish = await this.dishRepository.getById(orderItems.dishId);
        employeeWeeklyOrder.dish = dish;
      }
      result.push({
        id: employeeWeeklyOrder.id,
        employeeId: employeeWeeklyOrder.employeeId,
        dayOfWeek: employeeWeeklyOrder.dayOfWeek,
        orderItemId: employeeWeeklyOrder.orderItemId,
        order: orderItems,
        dish: employeeWeeklyOrder.dish,
      });
    }

     return result.map(order => ({
      id: order.id,
      employeeId: order.employeeId,
      dayOfWeek: order.dayOfWeek,
      orderItemId: order.orderItemId,
      order: order.order,
      dish: {
        id: order.dish.id,
        restaurantId: order.dish.restaurantId,
        name: order.dish.name,
        description: order.dish.description,
        price: order.dish.price,
        image: order.dish.image,
      },
     }));
  }
} 