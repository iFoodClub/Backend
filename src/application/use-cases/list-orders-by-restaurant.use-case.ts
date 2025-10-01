import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyOrderRepository } from '../../infrastructure/database/repositories/company-order.repository';
import { ICompanyOrder } from '../../domain/models/company-order.model';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';

@Injectable()
export class ListOrdersByRestaurantUseCase {
  constructor(
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(restaurantId: number): Promise<ICompanyOrder[]> {
    const orders = await this.companyOrderRepository.findOrdersByRestaurant(restaurantId);

    const companyOrders = await Promise.all(orders.map(async order => {
      const plainOrder = order.get({ plain: true });
      
      // Calcular preço total
      const totalPrice =  plainOrder.collaboratorsOrders?.reduce((total, empOrder) => {
        return total + (empOrder.dish?.price || 0);
      }, 0) || 0;
      let employeeId = plainOrder.collaboratorsOrders?.map(empOrder => empOrder.employee?.id) as number[]
      const employee = await this.employeeRepository.getById(employeeId[0])
      const userEmployee = await this.userRepository.getById(employee?.userId)
      const company = await this.companyRepository.getById(plainOrder.company?.id)
      const userCompany = await this.userRepository.getById(company?.userId)

      // Mapear status do backend para o frontend
      const statusMap = {
        'pending': 'Enviado',
        'confirmed': 'Confirmado',
        'preparing': 'Preparando',
        'delivered': 'Entregue',
        'canceled': 'Cancelado',
      };

      // Mapear status dos pedidos individuais
      const individualStatusMap = {
        'preparing': 'Preparando',
        'completed': 'Concluido',
      };
      return {
        id: plainOrder.id,
        code: `FC-${plainOrder.id}`,
        totalPrice,
        status: statusMap[plainOrder.status] || 'Enviado',
        restaurantId: plainOrder.restaurantId,
        company: {
          id: plainOrder.company?.id || 0,
          name: company?.name || 'Empresa',
          image: userCompany?.profileImage || '',
        },
        employeeOrders: plainOrder.collaboratorsOrders?.map(empOrder => ({
          
          id: empOrder.id,
          status: individualStatusMap[empOrder.status] || 'Preparando',
          employee: {
            id: empOrder.employee?.id || 0,
            name: employee?.name || 'Funcionário',
            image: userEmployee?.profileImage || '',
          },
          dish: {
            id: empOrder.dish?.id || 0,
            name: empOrder.dish?.name || 'Prato',
            image: empOrder.dish?.image || '',
            price: empOrder.dish?.price || 0,
            restaurantId: empOrder.dish?.restaurantId || 0,
          },
        })) || [],
      };
    }));
    if (!orders || orders.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado para este restaurante.');
    }
    return companyOrders;
  }
} 