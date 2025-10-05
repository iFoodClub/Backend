import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';

@Injectable()
export class DeleteWeeklyOrderService {
  constructor(
    @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
    private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const order = await this.employeeWeeklyOrdersRepository.getById(id);
    if (!order) {
      throw new NotFoundException('Pedido semanal não encontrado');
    }
    await this.employeeWeeklyOrdersRepository.delete(id);
  }
} 