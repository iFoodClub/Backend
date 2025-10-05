import { Inject, Injectable } from '@nestjs/common';
import { CompanyOrderEntityInterface } from '../../../domain/repositories/company-order.repository.interface';
import { CompanyOrderEntity } from '../entities/company-order.entity';
import { CompanyEntity } from '../entities/company.entity';
import { IndividualOrderEntity } from '../entities/individual-order.entity';
import { EmployeeEntity } from '../entities/employee.entity';
import { DishEntity } from '../entities/dish.entity';
import { ICompanyOrder } from 'src/domain/models/company-order.model';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class CompanyOrderRepository {
  constructor(
    @Inject('COMPANY_ORDER_ENTITY')
    private readonly companyOrderEntity: typeof CompanyOrderEntity,
  ) {}

  async create(order: Omit<CompanyOrderEntityInterface, 'id'>): Promise<CompanyOrderEntityInterface> {
    return await this.companyOrderEntity.create(order);
  }

  async update(
    id: number,
    orderData: Partial<Omit<CompanyOrderEntityInterface, 'id'>>,
  ): Promise<CompanyOrderEntityInterface> {
    const order = await this.companyOrderEntity.findByPk(id);
    return await order.update(orderData);
  }

  async getById(id: number): Promise<CompanyOrderEntityInterface | null> {
    return await this.companyOrderEntity.findByPk(id, {
      include: ['collaboratorsOrders'],
    });
  }

  async listByCompany(companyId: number): Promise<CompanyOrderEntityInterface[]> {
    return await this.companyOrderEntity.findAll({ where: { companyId } });
  }

  async findOrdersByRestaurant(restaurantId: number): Promise<CompanyOrderEntity[]> {
    const companyOrders = await this.companyOrderEntity.findAll({
      where: { restaurantId },
      include: [
        {
          model: CompanyEntity,
          include: [
            {
              model: UserEntity,
              as: 'user',
            },
          ],
        },
        {
          model: IndividualOrderEntity,
          as: 'collaboratorsOrders',
          include: [
            {
              model: EmployeeEntity,
              include: [
                {
                  model: UserEntity,
                  as: 'user',
                },
              ],
            },
            {
              model: DishEntity,
            },
          ],
        },
      ],
    });

    return companyOrders
  }

  async listByRestaurant(restaurantId: number): Promise<CompanyOrderEntityInterface[]> {
    return await this.companyOrderEntity.findAll({ where: { restaurantId } });
  }

  async updateStatus(id: number, status: string): Promise<CompanyOrderEntityInterface> {
    const order = await this.companyOrderEntity.findByPk(id);
    return await order.update({ status });
  }

  async delete(id: number): Promise<void> {
    const order = await this.companyOrderEntity.findByPk(id);
    await order.destroy();
  }
}