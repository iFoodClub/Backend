import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { IndividualOrderRepository } from 'src/infrastructure/database/repositories/individual-order.repository';
import { EmployeeWeeklyOrdersEntityInterface } from 'src/domain/repositories/employee-weekly-orders.repository.interface';
import { OrderItemEntityInterface } from 'src/domain/repositories/order-item.repository.interface';
import { OrderItemRepository } from 'src/infrastructure/database/repositories/order-item.repository';

@Injectable()
export class CreateOrUpdateWeeklyOrderService {
  constructor(
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('ORDER_ITEM_REPOSITORY')
    private readonly orderItemRepository: OrderItemRepository,
  ) {}

  async execute(employeeWeeklyOrder: EmployeeWeeklyOrdersEntityInterface): Promise<EmployeeWeeklyOrdersEntityInterface> {
    const employee = await this.employeeRepository.getById(employeeWeeklyOrder.employeeId);
    if (!employee) {
        throw new NotFoundException('Funcionário não encontrado');
    }
    
    // Primeiro criar o OrderItem (não tem id ainda, vem apenas dishId e quantity)
    const orderItems = await this.orderItemRepository.create(employeeWeeklyOrder.order);
    
    const individualOrder = {
      employeeId: employeeWeeklyOrder.employeeId,
      dayOfWeek: employeeWeeklyOrder.dayOfWeek,
      orderItemId: orderItems.id,
    }

    const existingOrder = await this.employeeWeeklyOrdersRepository.findByEmployeeAndDay(employeeWeeklyOrder.employeeId,employeeWeeklyOrder.dayOfWeek);
    if (existingOrder) {
      // Atualizar o pedido semanal existente com o novo OrderItem
      const updatedWeeklyOrder = await this.employeeWeeklyOrdersRepository.update(existingOrder.id, individualOrder);

      if (!updatedWeeklyOrder) {
        throw new NotFoundException('Erro ao atualizar pedido semanal');
      }
      return updatedWeeklyOrder;
    } else {
      // Criar novo pedido semanal
      const newOrder = await this.employeeWeeklyOrdersRepository.create(individualOrder);
      if (!newOrder) {
        throw new NotFoundException('Erro ao criar pedido semanal');
      }

      return newOrder;
    }
  }
} 