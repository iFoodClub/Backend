import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { DishRepository } from '../../infrastructure/database/repositories/dish.repository';
import { CreateCompanyOrderDto, CreateIndividualOrderDto } from '../../interfaces/http/dtos/request/create-company-order.dto';
import { CompanyOrderStatus } from '../../domain/repositories/company-order.repository.interface';
import { IndividualOrderStatus } from '../../domain/repositories/individual-order.repository.interface';

@Injectable()
export class CreateIndividualOrderUseCase {
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

  async execute(createOrderDto: CreateIndividualOrderDto): Promise<{message: string}> {
    // Validar se a empresa existe
    const company = await this.companyRepository.getById(createOrderDto.companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Validar se o restaurante existe
    const restaurant = await this.restaurantRepository.getById(createOrderDto.restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    // Validar se todos os funcionários existem
    // for (const order of createOrderDto.individualOrders) {
      const employee = await this.employeeRepository.getById(createOrderDto.employeeId);
      if (!employee) {
        throw new NotFoundException(`Funcionário com ID ${createOrderDto.employeeId} não encontrado`);
      }
    // }

    // Validar se todos os pratos existem
    // for (const order of createOrderDto.individualOrders) {
      const dish = await this.dishRepository.getById(createOrderDto.dishId);
      if (!dish) {
        throw new NotFoundException(`Prato com ID ${createOrderDto.dishId} não encontrado`);
      }
    // }

    // Criar o pedido da empresa
    // const companyOrder = await this.companyOrderRepository.create({
    //   companyId: createOrderDto.companyId,
    //   restaurantId: createOrderDto.restaurantId,
    //   status: CompanyOrderStatus.PENDING,
    // });

    // Criar os pedidos individuais dos funcionários
    // for (const order of createOrderDto.individualOrders) {
      await this.individualOrderRepository.create({
        // companyOrderId: companyOrder.id,
        companyId: createOrderDto.companyId,
        employeeId: createOrderDto.employeeId,
        restaurantId: createOrderDto.restaurantId,
        dishId: createOrderDto.dishId,
        status: IndividualOrderStatus.PREPARING,
      });
    // }

    return {
      // id: companyOrder.id,
      message: 'Pedido criado com sucesso',
    };
  }
}
