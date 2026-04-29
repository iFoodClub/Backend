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
      
      // Calcular preço total (convertendo strings para números)
      const totalPrice = plainOrder.collaboratorsOrders?.reduce((total, empOrder) => {
        const price = empOrder.dish?.price || 0;
        const priceAsNumber = typeof price === 'string' ? parseFloat(price) : Number(price);
        return total + (isNaN(priceAsNumber) ? 0 : priceAsNumber);
      }, 0) || 0;
      
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
      
      // Mapear employeeOrders buscando os dados de cada funcionário individualmente
      const employeeOrders = await Promise.all(
        (order.collaboratorsOrders || []).map(async (empOrderEntity) => {
          // Tentar usar os dados do objeto Sequelize primeiro (mais eficiente)
          const employeeEntity = empOrderEntity.employee;
          let employeeName = employeeEntity?.name;
          let employeeImage = employeeEntity?.user?.profileImage;
          
          // Se nome ou imagem não estiverem disponíveis, buscar individualmente
          if (employeeEntity?.id && (!employeeName || !employeeImage)) {
            const employee = await this.employeeRepository.getById(employeeEntity.id);
            if (employee) {
              employeeName = employee.name || employeeName || 'Funcionário';
              if (employee.userId) {
                const userEmployee = await this.userRepository.getById(employee.userId);
                employeeImage = userEmployee?.profileImage || employeeImage || '';
              }
            }
          }
          
          const plainEmpOrder = empOrderEntity.get({ plain: true });
          
          return {
            id: plainEmpOrder.id,
            status: individualStatusMap[plainEmpOrder.status] || 'Preparando',
            employee: {
              id: employeeEntity?.id || 0,
              name: employeeName || 'Funcionário',
              image: employeeImage || '',
            },
            dish: {
              id: plainEmpOrder.dish?.id || 0,
              name: plainEmpOrder.dish?.name || 'Prato',
              image: plainEmpOrder.dish?.image || '',
              price: plainEmpOrder.dish?.price || 0,
              restaurantId: plainEmpOrder.dish?.restaurantId || 0,
            },
          };
        })
      );
      
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
        employeeOrders,
      };
    }));
    return companyOrders;
  }
}