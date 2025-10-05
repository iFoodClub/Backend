import { Inject, Injectable } from '@nestjs/common';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderItemEntityInterface } from '../../../domain/repositories/order-item.repository.interface';

@Injectable()
export class OrderItemRepository {
  constructor(
    @Inject('ORDER_ITEM_ENTITY')
    private readonly orderItemEntity: typeof OrderItemEntity,
  ) {}

  async create(item: Omit<OrderItemEntityInterface, 'id'>): Promise<OrderItemEntityInterface> {
    return await this.orderItemEntity.create(item);
  }

  async update(
    id: number,
    itemData: Partial<Omit<OrderItemEntityInterface, 'id'>>,
  ): Promise<OrderItemEntityInterface> {
    const item = await this.orderItemEntity.findByPk(id);
    return await item.update(itemData);
  }

  async listByOrder(orderId: number): Promise<OrderItemEntityInterface[]> {
    return await this.orderItemEntity.findAll({ where: { individualOrderId: orderId } });
  }

  async findByPk(id: number): Promise<OrderItemEntityInterface> {
    return await this.orderItemEntity.findByPk(id);
  }

  async delete(id: number): Promise<void> {
    const item = await this.orderItemEntity.findByPk(id);
    await item.destroy();
  }

  async deleteByOrder(orderId: number): Promise<void> {
    await this.orderItemEntity.destroy({ where: { individualOrderId: orderId } });
  }
}