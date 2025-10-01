import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { OrderItemRepository } from '../../infrastructure/database/repositories/order-item.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { IndividualOrderStatus } from '../../domain/repositories/individual-order.repository.interface';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';
import { DayOfWeek } from '../../domain/repositories/employee-weekly-orders.repository.interface';

@Injectable()
export class CreateOrdersFromWeeklyOrdersUseCase {
  constructor(
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: OrderItemRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
  ) {}

  private getCurrentDayOfWeek(): DayOfWeek {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    return days[today] as DayOfWeek;
  }

  async execute(companyId: number): Promise<{ message: string; ordersCreated: number; currentDay: DayOfWeek }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const employees = await this.employeeRepository.listByCompany(companyId);
    if (employees.length === 0) {
      throw new NotFoundException('Nenhum funcionário encontrado para esta empresa');
    }

    const currentDay = this.getCurrentDayOfWeek();
    let ordersCreated = 0;

    for (const employee of employees) {
      // Buscar apenas os pedidos do dia atual
      const weeklyOrder = await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(employee.id, currentDay);
      
      if (weeklyOrder && weeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(weeklyOrder.orderItemId);
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            // Criar pedido individual
            const individualOrder = await this.individualOrderRepository.create({
              employeeId: employee.id,
              dishId: dish.id,
              status: IndividualOrderStatus.PREPARING,
              companyOrderId: null, // Será atualizado quando o pedido da empresa for criado
            });

            ordersCreated++;
          }
        }
      }
    }

    if (ordersCreated > 0) {
      // Criar pedido da empresa
      const companyOrder = await this.companyOrderRepository.create({
        companyId: companyId,
        restaurantId: company.restaurantId,
        status: CompanyOrderStatus.PENDING,
      });

      // Atualizar os pedidos individuais com o ID do pedido da empresa
      const pendingOrders = await this.individualOrderRepository.listByCompanyOrderIdNull(companyId);
      
      for (const order of pendingOrders) {
        await this.individualOrderRepository.update({
          id: order.id,
          companyOrderId: companyOrder.id,
          status: IndividualOrderStatus.PREPARING,
        });
      }
    }

    return {
      message: ordersCreated > 0 
        ? `Pedidos criados com sucesso baseados nos pedidos semanais de ${currentDay}` 
        : `Nenhum pedido semanal encontrado para ${currentDay}`,
      ordersCreated,
      currentDay,
    };
  }
} 