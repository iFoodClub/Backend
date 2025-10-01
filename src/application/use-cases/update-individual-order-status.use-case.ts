import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { IndividualOrderStatus } from '../../domain/repositories/individual-order.repository.interface';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

@Injectable()
export class UpdateIndividualOrderStatusUseCase {
  constructor(
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
  ) {}

  async execute(id: number, status: IndividualOrderStatus): Promise<{ message: string; companyOrderUpdated?: boolean }> {
    // Verificar se o pedido individual existe
    const individualOrder = await this.individualOrderRepository.getById(id);
    if (!individualOrder) {
      throw new NotFoundException('Pedido individual não encontrado');
    }

    // Atualizar o status do pedido individual
    await this.individualOrderRepository.updateStatus(id, status);

    // Se o status foi alterado para 'completed', verificar se todos os pedidos da empresa estão completos
    if (status === IndividualOrderStatus.COMPLETED) {
      const allCompleted = await this.individualOrderRepository.areAllOrdersCompleted(individualOrder.companyOrderId);
      
      if (allCompleted) {
        // Atualizar o status do pedido da empresa para 'delivered'
        await this.companyOrderRepository.updateStatus(individualOrder.companyOrderId, CompanyOrderStatus.DELIVERED);
        
        return {
          message: 'Status do pedido individual atualizado e pedido da empresa marcado como entregue',
          companyOrderUpdated: true
        };
      }
    }

    return {
      message: 'Status do pedido individual atualizado com sucesso'
    };
  }
} 