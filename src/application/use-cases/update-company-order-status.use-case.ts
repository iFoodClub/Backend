import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';

@Injectable()
export class UpdateCompanyOrderStatusUseCase {
  constructor(
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
  ) {}

  async execute(id: number, status: CompanyOrderStatus): Promise<{ message: string }> {
    // Verificar se o pedido da empresa existe
    const companyOrder = await this.companyOrderRepository.getById(id);
    if (!companyOrder) {
      throw new NotFoundException('Pedido da empresa não encontrado');
    }

    // Atualizar o status do pedido da empresa
    await this.companyOrderRepository.updateStatus(id, status);

    return {
      message: 'Status do pedido da empresa atualizado com sucesso'
    };
  }
} 