/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { OrderItemRepository } from '../../infrastructure/database/repositories/order-item.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

interface WeeklyOrderWithDetails {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  dayOfWeek: string;
  orderItemId: number | null;
  dish: {
    id: number;
    name: string;
    price: number;
    image: string;
    restaurantId: number;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ListAllWeeklyOrdersService {
  constructor(
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: OrderItemRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<WeeklyOrderWithDetails[]> {
    // Buscar todos os pedidos semanais
    const allWeeklyOrders = await this.employeeWeeklyOrdersRepository.findAll();

    const ordersWithDetails: WeeklyOrderWithDetails[] = [];

    for (const weeklyOrder of allWeeklyOrders) {
      // Buscar informações do funcionário
      const employee = await this.employeeRepository.getById(
        weeklyOrder.employeeId,
      );
      if (!employee) continue;

      // Buscar informações do usuário (para pegar nome e email)
      const user = await this.userRepository.getById(employee.userId);
      if (!user) continue;

      // Buscar informações do prato (se houver pedido)
      let dishInfo = null;
      if (weeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(
          weeklyOrder.orderItemId,
        );
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            dishInfo = {
              id: dish.id,
              name: dish.name,
              price: dish.price,
              image: dish.image,
              restaurantId: dish.restaurantId,
            };
          }
        }
      }

      ordersWithDetails.push({
        id: weeklyOrder.id,
        employeeId: weeklyOrder.employeeId,
        employeeName: employee.name,
        employeeEmail: user.email,
        dayOfWeek: weeklyOrder.dayOfWeek,
        orderItemId: weeklyOrder.orderItemId,
        dish: dishInfo,
        createdAt: weeklyOrder.createdAt,
        updatedAt: weeklyOrder.updatedAt,
      });
    }

    return ordersWithDetails;
  }
}
