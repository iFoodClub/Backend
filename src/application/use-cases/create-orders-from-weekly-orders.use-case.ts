import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { OrderItemRepository } from '../../infrastructure/database/repositories/order-item.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import {
  IndividualOrderStatus,
  IndividualOrderEntityInterface,
} from '../../domain/repositories/individual-order.repository.interface';
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
    message: string;
    ordersCreated: number;
    currentDay: DayOfWeek;
  }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const employees = await this.employeeRepository.listByCompany(companyId);
    if (employees.length === 0) {
      throw new NotFoundException(
        'Nenhum funcionário encontrado para esta empresa',
      );
    }

    const currentDay = this.getCurrentDayOfWeek();

    // Verificar se já existem pedidos individuais pendentes para hoje
    const existingPendingOrders =
      await this.individualOrderRepository.listByCompanyOrderIdNull(companyId);
    if (existingPendingOrders.length > 0) {
      throw new BadRequestException(
        `Já existem ${existingPendingOrders.length} pedido(s) pendente(s) para hoje. Finalize ou cancele os pedidos existentes antes de criar novos.`,
      );
    }

    // Criar pedidos individuais apenas para funcionários que têm pedidos semanais
    let ordersCreated = 0;
    let restaurantId: number | null = null;
    const createdOrderIds: number[] = [];

    for (const employee of employees) {
      // Buscar os pedidos do dia atual
      const weeklyOrder =
        await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(
          employee.id,
          currentDay,
        );

      if (weeklyOrder && weeklyOrder.orderItemId) {
        const orderItem = await this.orderItemRepository.findByPk(
          weeklyOrder.orderItemId,
        );
        if (orderItem && orderItem.dishId) {
          const dish = await this.dishRepository.getById(orderItem.dishId);
          if (dish) {
            // Guardar o restaurantId do primeiro prato encontrado
            if (!restaurantId) {
              restaurantId = dish.restaurantId;
            }

            // Criar pedido individual
            // Não incluir companyOrderId no create, será atualizado depois
            const orderData: Omit<IndividualOrderEntityInterface, 'id'> = {
              employeeId: employee.id,
              companyId: companyId,
              restaurantId: dish.restaurantId,
              dishId: dish.id,
              status: IndividualOrderStatus.PREPARING,
            };
            const createdOrder =
              await this.individualOrderRepository.create(orderData);

            createdOrderIds.push(createdOrder.id);
            ordersCreated++;
          }
        }
      }
    }

    // Verificar se algum pedido foi criado
    if (ordersCreated === 0) {
      throw new BadRequestException('Nenhum pedido individual foi criado');
    }

    // Validar se temos restaurantId
    if (!restaurantId && !company.restaurantId) {
      throw new BadRequestException(
        'Restaurante não identificado para criar o pedido da empresa',
      );
    }

    // Criar pedido da empresa
    const companyOrder = await this.companyOrderRepository.create({
      companyId: companyId,
      restaurantId: restaurantId || company.restaurantId,
      status: CompanyOrderStatus.PENDING,
    });

    // Atualizar os pedidos individuais com o ID do pedido da empresa
    // Usar os IDs dos pedidos criados para garantir que atualizamos os corretos
    for (const orderId of createdOrderIds) {
      await this.individualOrderRepository.update({
        id: orderId,
        companyOrderId: companyOrder.id,
        status: IndividualOrderStatus.PREPARING,
      });
    }

    return {
      message: `Pedidos criados com sucesso baseados nos pedidos semanais de ${currentDay}. ${ordersCreated} pedido(s) criado(s) de ${employees.length} funcionário(s).`,
      ordersCreated,
      currentDay,
    };
  }
}
