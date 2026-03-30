import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';
import { IndividualOrderStatus } from '../../domain/repositories/individual-order.repository.interface';

@Injectable()
export class CreateCompanyOrderUseCase {
  constructor(
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('DISH_REPOSITORY')
    private readonly dishRepository: DishRepository,
  ) {}

  async execute(companyId: number): Promise<{ message: string; id: number }> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const createOrderDto =
      await this.individualOrderRepository.listByCompanyOrderIdNull(companyId);

    // Verificar se existem pedidos pendentes
    if (!createOrderDto || createOrderDto.length === 0) {
      throw new NotFoundException(
        'Nenhum pedido individual pendente encontrado para esta empresa',
      );
    }

    // Validar se o restaurante existe
    const restaurant = await this.restaurantRepository.getById(
      createOrderDto[0].restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    // Validar se todos os funcionários existem
    for (const order of createOrderDto) {
      const employee = await this.employeeRepository.getById(order.employeeId);

      if (!employee) {
        throw new NotFoundException(
          `Funcionário com ID ${order.employeeId} não encontrado`,
        );
      }
    }

    // Validar se todos os pratos existem
    for (const order of createOrderDto) {
      const dish = await this.dishRepository.getById(order.dishId);
      if (!dish) {
        throw new NotFoundException(
          `Prato com ID ${order.dishId} não encontrado`,
        );
      }
    }

    // Criar o pedido da empresa
    const companyOrder = await this.companyOrderRepository.create({
      companyId: createOrderDto[0].companyId,
      restaurantId: createOrderDto[0].restaurantId,
      status: CompanyOrderStatus.CREATED,
    });
    // Criar os pedidos individuais dos funcionários
    for (const order of createOrderDto) {
      await this.individualOrderRepository.update({
        id: order.id,
        companyOrderId: companyOrder.id,
        status: IndividualOrderStatus.PREPARING,
      });
    }

    return {
      id: companyOrder.id,
      message: 'Pedido criado com sucesso',
    };
  }
}
