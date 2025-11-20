import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IndividualOrderRepository } from "src/infrastructure/database/repositories/individual-order.repository";
import { CompanyRepository } from "src/infrastructure/database/repositories/company.repository";
import { CompanyOrderRepository } from "src/infrastructure/database/repositories/company-order.repository";
import { IndividualOrderEntityInterface } from "src/domain/repositories/individual-order.repository.interface";
import { EmployeeRepository } from "src/infrastructure/database/repositories/employee.repository";
import { UserRepository } from "src/infrastructure/database/repositories/user.repository";
import { RestaurantRepository } from "src/infrastructure/database/repositories/restaurant.repository";

@Injectable()
export class ListIndividualOrderByCompanyUseCase {
  constructor(
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('COMPANY_ORDER_REPOSITORY')
    private readonly companyOrderRepository: CompanyOrderRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async execute(companyId: number): Promise<any[]> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Buscar todos os pedidos da empresa (company orders) com seus pedidos individuais
    const companyOrders = await this.companyOrderRepository.findOrdersHistoryByCompany(companyId);
    
    // Buscar pedidos individuais que ainda não foram associados a um pedido da empresa
    const individualOrdersWithoutCompanyOrder = await this.individualOrderRepository.listByCompanyOrderIdNullWithIncludes(companyId);

    const history = [];

    // Processar pedidos da empresa
    for (const companyOrder of companyOrders) {
      const plainOrder = companyOrder.get({ plain: true });
      
      // Calcular preço total
      const totalPrice = plainOrder.collaboratorsOrders?.reduce((total, empOrder) => {
        return total + (empOrder.dish?.price || 0);
      }, 0) || 0;

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

      const employeeOrders = await Promise.all(
        (plainOrder.collaboratorsOrders || []).map(async (empOrder) => {
          const employee = await this.employeeRepository.getById(empOrder.employeeId);
          const userEmployee = await this.userRepository.getById(employee?.userId);

          return {
            id: empOrder.id,
            status: individualStatusMap[empOrder.status] || empOrder.status,
            employee: {
              name: employee?.name || '',
              id: employee?.id || empOrder.employeeId,
              image: userEmployee?.profileImage || null,
            },
            dish: {
              name: empOrder.dish?.name || '',
              id: empOrder.dish?.id || empOrder.dishId,
              image: empOrder.dish?.image || null,
              restaurantId: empOrder.dish?.restaurantId || plainOrder.restaurantId,
              price: empOrder.dish?.price || 0,
            },
          };
        })
      );

      history.push({
        id: plainOrder.id,
        code: `CO-${plainOrder.id}`,
        totalPrice,
        status: statusMap[plainOrder.status] || plainOrder.status,
        restaurantId: plainOrder.restaurantId,
        restaurant: {
          id: plainOrder.restaurant?.id,
          name: plainOrder.restaurant?.name,
          profileImage: plainOrder.restaurant?.user?.profileImage || plainOrder.restaurant?.image || null,
        },
        employeeOrders,
        createdAt: plainOrder.createdAt || null,
      });
    }

    // Processar pedidos individuais sem pedido da empresa
    for (const individualOrder of individualOrdersWithoutCompanyOrder) {
      const plainOrder = individualOrder.get({ plain: true });
      
      const individualStatusMap = {
        'preparing': 'Preparando',
        'completed': 'Concluido',
      };

      let restaurant = null;
      if (plainOrder.restaurantId) {
        const restaurantData = await this.restaurantRepository.getById(plainOrder.restaurantId);
        if (restaurantData) {
          const userRestaurant = await this.userRepository.getById(restaurantData.userId);
          restaurant = {
            id: restaurantData.id,
            name: restaurantData.name,
            profileImage: userRestaurant?.profileImage || null,
          };
        }
      }

      history.push({
        id: plainOrder.id,
        code: `IO-${plainOrder.id}`,
        totalPrice: plainOrder.dish?.price || 0,
        status: 'Pendente',
        restaurantId: plainOrder.restaurantId,
        restaurant,
        employeeOrders: [
          {
            id: plainOrder.id,
            status: individualStatusMap[plainOrder.status] || plainOrder.status,
            employee: {
              name: plainOrder.employee?.name || '',
              id: plainOrder.employee?.id || plainOrder.employeeId,
              image: plainOrder.employee?.user?.profileImage || null,
            },
            dish: plainOrder.dish ? {
              name: plainOrder.dish.name || '',
              id: plainOrder.dish.id || plainOrder.dishId,
              image: plainOrder.dish.image || null,
              restaurantId: plainOrder.dish.restaurantId || plainOrder.restaurantId,
              price: plainOrder.dish.price || 0,
            } : null,
          },
        ],
        createdAt: null,
      });
    }

    // Ordenar por data de criação (mais recentes primeiro)
    return history.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}