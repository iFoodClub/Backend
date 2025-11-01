/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { OrderItemRepository } from '../../infrastructure/database/repositories/order-item.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { IEmployeeWithWeeklyOrders } from '../../domain/models/weekly-orders-populated.model';
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
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
  ) {}

  private getCurrentDayOfWeek(): DayOfWeek {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const today = new Date().getDay();
    return days[today] as DayOfWeek;
  }

  async execute(companyId: number): Promise<{
    company: { id: number; name: string };
    currentDay: DayOfWeek;
    employees: IEmployeeWithWeeklyOrders[];
  }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const currentDay = this.getCurrentDayOfWeek();
    const employees = await this.employeeRepository.listByCompany(companyId);
    const result: IEmployeeWithWeeklyOrders[] = [];

    for (const employee of employees) {
      // Buscar apenas os pedidos do dia atual
      const employeeWeeklyOrder = await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(employee.id, currentDay);
      
      // Só incluir funcionários que têm pedido marcado para o dia atual
      if (employeeWeeklyOrder && employeeWeeklyOrder.orderItemId) {
        const weeklyOrders = [];
        const orderItem = await this.orderItemRepository.findByPk(employeeWeeklyOrder.orderItemId);
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            // Buscar informações do restaurant
            const restaurant = await this.restaurantRepository.getById(dish.restaurantId);
            if (restaurant) {
              const restaurantUser = await this.userRepository.getById(restaurant.userId);
              
              // Buscar informações do employee com profileImage
              const employeeUser = await this.userRepository.getById(employee.userId);

              weeklyOrders.push({
                id: employeeWeeklyOrder.id,
                employee: {
                  id: employee.id,
                  name: employee.name,
                  profileImage: employeeUser?.profileImage || '',
                },
                order: {
                  id: dish.id,
                  name: dish.name,
                  price: dish.price,
                  image: dish.image || '',
                },
              });

              // Só adiciona ao resultado se tiver pedido válido e restaurant
              if (weeklyOrders.length > 0 && restaurantUser) {
                result.push({
                  id: employee.id,
                  dayOfWeek: currentDay,
                  restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    profileImage: restaurantUser.profileImage || '',
                  },
                  weeklyOrders,
                });
              }
            }
          }
        }
      }
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
