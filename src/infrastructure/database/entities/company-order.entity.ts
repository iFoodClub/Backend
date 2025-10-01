import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { CompanyEntity } from './company.entity';
import { RestaurantEntity } from './restaurant.entity';
import { IndividualOrderEntity } from './individual-order.entity';
import { CompanyOrderStatus } from '../../../domain/repositories/company-order.repository.interface';

@Table({ tableName: 'company_order', timestamps: false })
export class CompanyOrderEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => CompanyEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  companyId: number;

  @ForeignKey(() => RestaurantEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  restaurantId: number;

  @Column({
    type: DataType.ENUM('pending', 'confirmed', 'preparing', 'delivered', 'canceled'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: CompanyOrderStatus;

  @BelongsTo(() => CompanyEntity)
  company: CompanyEntity;

  @BelongsTo(() => RestaurantEntity)
  restaurant: RestaurantEntity;

  @HasMany(() => IndividualOrderEntity)
  collaboratorsOrders: IndividualOrderEntity[];
}