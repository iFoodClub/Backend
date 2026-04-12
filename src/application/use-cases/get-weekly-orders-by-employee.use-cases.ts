/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeWeeklyOrderResponse } from 'src/interfaces/http/dtos/response/employeeWeeklyOrder.dto';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { OrderItemRepository } from 'src/infrastructure/database/repositories/order-item.repository';
import { EmployeeWeeklyOrdersEntityInterface } from 'src/domain/repositories/employee-weekly-orders.repository.interface';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';
import { DayOfWeek } from 'src/domain/repositories/employee-weekly-orders.repository.interface';

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

    const employeeWeeklyOrders =
      await this.employeeWeeklyOrdersRepository.findByEmployeeId(employeeId);

    // Criar um mapa dos pedidos existentes por dia da semana
    const ordersMap = new Map<DayOfWeek, EmployeeWeeklyOrdersEntityInterface>();

    for (const employeeWeeklyOrder of employeeWeeklyOrders) {
      let orderItems = null;
      let dish = null;

      if (employeeWeeklyOrder.orderItemId) {
        orderItems = await this.orderItemRepository.findByPk(
          employeeWeeklyOrder.orderItemId,
        );
        if (orderItems?.dishId) {
          dish = await this.dishRepository.getById(orderItems.dishId);
        }
      }

      ordersMap.set(employeeWeeklyOrder.dayOfWeek, {
        id: employeeWeeklyOrder.id,
        employeeId: employeeWeeklyOrder.employeeId,
        dayOfWeek: employeeWeeklyOrder.dayOfWeek,
        orderItemId: employeeWeeklyOrder.orderItemId,
        order: orderItems,
        dish: dish,
        createdAt: undefined,
        updatedAt: undefined,
      });
    }

    // Definir todos os dias da semana na ordem correta
    const allDaysOfWeek: DayOfWeek[] = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    // Retornar todos os dias da semana, preenchendo com dados do pedido se existir
    return allDaysOfWeek.map((dayOfWeek) => {
      const order = ordersMap.get(dayOfWeek);

      if (order) {
        return {
          id: order.id,
          employeeId: order.employeeId,
          dayOfWeek: order.dayOfWeek,
          orderItemId: order.orderItemId,
          order: order.order || [],
          dish: order.dish
            ? {
                id: order.dish.id,
                restaurantId: order.dish.restaurantId,
                name: order.dish.name,
                description: order.dish.description,
                price: order.dish.price,
                image: order.dish.image,
              }
            : null,
        };
      } else {
        // Retornar dia sem pedido
        return {
          id: null,
          employeeId: employeeId,
          dayOfWeek: dayOfWeek,
          orderItemId: null,
          order: [],
          dish: null,
        };
      }
    });
  }
}
