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
import { DayOfWeek } from '../../domain/repositories/employee-weekly-orders.repository.interface';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';
import { EmployeeWeeklyOrderResponse } from '../../interfaces/http/dtos/response/employeeWeeklyOrder.dto';

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
    employees: Array<{
      id: number;
      name: string;
      profileImage: string | null;
      weeklyOrders: EmployeeWeeklyOrderResponse[];
    }>;
  }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const currentDay = this.getCurrentDayOfWeek();
    const employees =
      await this.employeeRepository.listByCompanyWithProfileImage(companyId);
    const result = [];

    for (const employee of employees) {
      // Buscar apenas os pedidos do dia atual
      const employeeWeeklyOrder =
        await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(
          (employee as { id: number }).id,
          currentDay,
        );
      const weeklyOrders: EmployeeWeeklyOrderResponse[] = [];

      // Só incluir funcionários que têm pedido marcado para o dia atual
      if (employeeWeeklyOrder && employeeWeeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(
          employeeWeeklyOrder.orderItemId,
        );

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
          } else {
            weeklyOrders.push({
              id: employeeWeeklyOrder.id,
              employeeId: employeeWeeklyOrder.employeeId,
              dayOfWeek: employeeWeeklyOrder.dayOfWeek,
              orderItemId: employeeWeeklyOrder.orderItemId,
              order: orderItem,
              dish: null,
            });
          }
        } else {
          weeklyOrders.push({
            id: employeeWeeklyOrder.id,
            employeeId: employeeWeeklyOrder.employeeId,
            dayOfWeek: employeeWeeklyOrder.dayOfWeek,
            orderItemId: employeeWeeklyOrder.orderItemId,
            order: orderItem ?? [],
            dish: null,
          });
        }
      } else {
        weeklyOrders.push({
          id: null,
          employeeId: (employee as { id: number }).id,
          dayOfWeek: currentDay,
          orderItemId: null,
          order: [],
          dish: null,
        });
      }

      const employeeTyped = employee as {
        id: number;
        name: string;
        profileImage?: string | null;
      };
      result.push({
        id: employeeTyped.id,
        name: employeeTyped.name,
        profileImage: employeeTyped.profileImage ?? null,
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

  /**
   * Retorna pedidos semanais agrupados por restaurante
   * Estrutura simplificada: 1 empresa → 1 restaurante → N funcionários
   */
  async executeGroupedByRestaurant(companyId: number): Promise<{
    company: { id: number; name: string };
    dayOfWeek: DayOfWeek;
    orderDate: string;
    orderStatus: CompanyOrderStatus;
    restaurant: {
      id: number;
      name: string;
      profileImage: string;
    } | null;
    employees: Array<{
      id: number;
      name: string;
      profileImage: string;
      order: Array<{
        id: number;
        name: string;
        price: number;
        image: string;
      }>;
    }>;
  }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const currentDay = this.getCurrentDayOfWeek();
    const employees = await this.employeeRepository.listByCompany(companyId);

    const employeesList: Array<{
      id: number;
      name: string;
      profileImage: string;
      order: Array<{
        id: number;
        name: string;
        price: number;
        image: string;
      }>;
    }> = [];

    let restaurantData: {
      id: number;
      name: string;
      profileImage: string;
    } | null = null;

    // Processar cada funcionário
    for (const employee of employees) {
      const employeeWeeklyOrder =
        await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(
          employee.id,
          currentDay,
        );

      // Buscar informações do funcionário
      const employeeUser = await this.userRepository.getById(
        employee.userId,
      );

      const orderData: Array<{
        id: number;
        name: string;
        price: number;
        image: string;
      }> = [];

      if (employeeWeeklyOrder && employeeWeeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(
          employeeWeeklyOrder.orderItemId,
        );
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            // Buscar o restaurante (só precisa buscar uma vez)
            if (!restaurantData) {
              const restaurant = await this.restaurantRepository.getById(
                dish.restaurantId,
              );
              if (restaurant) {
                const restaurantUser = await this.userRepository.getById(
                  restaurant.userId,
                );
                if (restaurantUser) {
                  restaurantData = {
                    id: restaurant.id,
                    name: restaurant.name,
                    profileImage: restaurantUser.profileImage,
                  };
                }
              }
            }

            orderData.push({
              id: dish.id,
              name: dish.name,
              price: dish.price,
              image: dish.image || '',
            });
          }
        }
      }

      // Adicionar funcionário à lista (mesmo sem pedido)
      employeesList.push({
        id: employee.id,
        name: employee.name,
        profileImage: employeeUser?.profileImage || '',
        order: orderData,
      });
    }

    return {
      company: {
        id: company.id,
        name: company.name,
      },
      dayOfWeek: currentDay,
      orderDate: new Date().toISOString(),
      orderStatus: CompanyOrderStatus.CREATED,
      restaurant: restaurantData,
      employees: employeesList,
    };
  }
}
