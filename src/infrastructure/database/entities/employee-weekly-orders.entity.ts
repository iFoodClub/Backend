import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { EmployeeEntity } from './employee.entity';
import { IndividualOrderEntity } from './individual-order.entity';
import { DayOfWeek } from '../../../domain/repositories/employee-weekly-orders.repository.interface';
import { OrderItemEntity } from './order-item.entity';

@Table({ tableName: 'employee_weekly_orders', timestamps: false })
export class EmployeeWeeklyOrdersEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => EmployeeEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'employeeId',
  })
  employeeId: number;

  @Column({
    type: DataType.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
    field: 'dayOfWeek',
  })
  dayOfWeek: DayOfWeek;

  @ForeignKey(() => OrderItemEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'orderItemId',
  })
  orderItemId: number;


  @BelongsTo(() => EmployeeEntity)
  employee: EmployeeEntity;

}