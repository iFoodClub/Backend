import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

@Injectable()
export class SendOrdersUseCase {
  constructor(
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
  ) {}

  async execute(orderIds: number[]): Promise<void> {
    for (const orderId of orderIds) {
      const order = await this.companyOrderRepository.getById(orderId);
      if (!order) {
        throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
      }
      
      await this.companyOrderRepository.updateStatus(orderId, CompanyOrderStatus.DELIVERED);
    }
  }
} 