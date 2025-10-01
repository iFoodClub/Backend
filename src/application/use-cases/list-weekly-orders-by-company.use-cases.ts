import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { OrderItemRepository } from '../../infrastructure/database/repositories/order-item.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { EmployeeWeeklyOrderResponse } from '../../interfaces/http/dtos/response/employeeWeeklyOrder.dto';
import { DayOfWeek } from '../../domain/repositories/employee-weekly-orders.repository.interface';

@Injectable()
export class ListWeeklyOrdersByCompanyService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: OrderItemRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
  ) {}

  private getCurrentDayOfWeek(): DayOfWeek {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    return days[today] as DayOfWeek;
  }

  async execute(companyId: number): Promise<{
    company: { id: number; name: string };
    currentDay: DayOfWeek;
    employees: Array<{
      id: number;
      name: string;
      weeklyOrders: EmployeeWeeklyOrderResponse[];
    }>;
  }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const currentDay = this.getCurrentDayOfWeek();
    const employees = await this.employeeRepository.listByCompany(companyId);
    const result = [];

    for (const employee of employees) {
      // Buscar apenas os pedidos do dia atual
      const employeeWeeklyOrder = await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(employee.id, currentDay);
      const weeklyOrders = [];

      if (employeeWeeklyOrder && employeeWeeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(employeeWeeklyOrder.orderItemId);
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            weeklyOrders.push({
              id: employeeWeeklyOrder.id,
              employeeId: employeeWeeklyOrder.employeeId,
              dayOfWeek: employeeWeeklyOrder.dayOfWeek,
              orderItemId: employeeWeeklyOrder.orderItemId,
              order: orderItem,
              dish: {
                id: dish.id,
                restaurantId: dish.restaurantId,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                image: dish.image,
              },
            });
          }
        }
      }

      result.push({
        id: employee.id,
        name: employee.name,
        weeklyOrders,
      });
    }

    return {
      company: {
        id: company.id,
        name: company.name,
      },
      currentDay,
      employees: result,
    };
  }
} 