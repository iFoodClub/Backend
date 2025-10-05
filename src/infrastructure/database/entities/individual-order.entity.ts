import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { EmployeeEntity } from './employee.entity';
import { OrderItemEntity } from './order-item.entity';
import { CompanyOrderEntity } from './company-order.entity';
import { DishEntity } from './dish.entity';

export enum IndividualOrderStatus {
  PREPARING = 'preparing',
  COMPLETED = 'completed',
}

@Table({ tableName: 'individual_order', timestamps: false })
export class IndividualOrderEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => CompanyOrderEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'companyOrderId',
  })
  companyOrderId: number;

  @ForeignKey(() => EmployeeEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'employeeId',
  })
  employeeId: number;

  @ForeignKey(() => DishEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'dish_id',
  })
  dishId: number;

  @Column({
    type: DataType.ENUM('preparing', 'completed'),
    allowNull: false,
    defaultValue: 'preparing',
  })
  status: IndividualOrderStatus;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'companyid',
  })
  companyId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'restaurantid',
  })
  restaurantId: number;

  @BelongsTo(() => CompanyOrderEntity)
  companyOrder: CompanyOrderEntity;

  @BelongsTo(() => EmployeeEntity)
  employee: EmployeeEntity;

  @BelongsTo(() => DishEntity)
  dish: DishEntity;

}