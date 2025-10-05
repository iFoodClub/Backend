import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';

@Injectable()
export class GetOrderProgressUseCase {
  constructor(
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
  ) {}

  async execute(companyOrderId: number): Promise<{
    companyOrderId: number;
    companyOrderStatus: string;
    totalOrders: number;
    completedOrders: number;
    progressPercentage: number;
    isAllCompleted: boolean;
  }> {
    // Verificar se o pedido da empresa existe
    const companyOrder = await this.companyOrderRepository.getById(companyOrderId);
    if (!companyOrder) {
      throw new NotFoundException('Pedido da empresa não encontrado');
    }

    // Obter contadores de pedidos
    const totalOrders = await this.individualOrderRepository.getTotalOrdersCount(companyOrderId);
    const completedOrders = await this.individualOrderRepository.getCompletedOrdersCount(companyOrderId);
    const isAllCompleted = await this.individualOrderRepository.areAllOrdersCompleted(companyOrderId);

    // Calcular porcentagem de progresso
    const progressPercentage = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    // Mapear status do backend para o frontend
    const statusMap = {
      'pending': 'Enviado',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'delivered': 'Entregue',
      'canceled': 'Cancelado',
    };

    return {
      companyOrderId,
      companyOrderStatus: statusMap[companyOrder.status] || 'Enviado',
      totalOrders,
      completedOrders,
      progressPercentage,
      isAllCompleted,
    };
  }
} 