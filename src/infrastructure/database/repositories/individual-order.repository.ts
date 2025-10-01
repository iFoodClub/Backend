import { Inject, Injectable } from '@nestjs/common';
import { IndividualOrderEntity } from '../entities/individual-order.entity';
import { IndividualOrderEntityInterface, IndividualOrderStatus } from '../../../domain/repositories/individual-order.repository.interface';

@Injectable()
export class IndividualOrderRepository {
  constructor(
    @Inject('INDIVIDUAL_ORDER_ENTITY')
    private readonly individualOrderEntity: typeof IndividualOrderEntity,
  ) {}

  async create(order: Omit<IndividualOrderEntityInterface, 'id'>): Promise<IndividualOrderEntityInterface> {
    return await this.individualOrderEntity.create(order);
  }

  async update(order: Partial<IndividualOrderEntityInterface>): Promise<number | null> {
    const result = await this.individualOrderEntity.update(order, { where: { id: order.id } });
    return result[0];
  }

  async getById(id: number): Promise<IndividualOrderEntityInterface | null> {
    return await this.individualOrderEntity.findByPk(id);
  }

  async listByCompanyOrder(companyOrderId: number): Promise<IndividualOrderEntityInterface[]> {
    return await this.individualOrderEntity.findAll({ where: { companyOrderId } });
  }

  async listByCompanyOrderIdNull(companyId: number): Promise<IndividualOrderEntityInterface[]> {
    return await this.individualOrderEntity.findAll({ where: { companyOrderId: null, companyId } });
  }

  async listByEmployee(employeeId: number): Promise<IndividualOrderEntityInterface[]> {
    return await this.individualOrderEntity.findAll({ where: { employeeId } });
  }

  async delete(id: number): Promise<void> {
    const order = await this.individualOrderEntity.findByPk(id);
    await order.destroy();
  }

  async updateStatus(id: number, status: IndividualOrderStatus): Promise<IndividualOrderEntityInterface> {
    const order = await this.individualOrderEntity.findByPk(id);
    if (!order) {
      throw new Error('Pedido individual não encontrado');
    }
    return await order.update({ status });
  }

  async areAllOrdersCompleted(companyOrderId: number): Promise<boolean> {
    const orders = await this.individualOrderEntity.findAll({ 
      where: { 
        companyOrderId,
        status: IndividualOrderStatus.PREPARING 
      } 
    });
    return orders.length === 0;
  }

  async getCompletedOrdersCount(companyOrderId: number): Promise<number> {
    const completedOrders = await this.individualOrderEntity.count({ 
      where: { 
        companyOrderId,
        status: IndividualOrderStatus.COMPLETED 
      } 
    });
    return completedOrders;
  }

  async getTotalOrdersCount(companyOrderId: number): Promise<number> {
    const totalOrders = await this.individualOrderEntity.count({ 
      where: { companyOrderId } 
    });
    return totalOrders;
  }
}