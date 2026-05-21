import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { CompanyEntity } from './company.entity';
import { DayOfWeek } from '../../../domain/repositories/employee-weekly-orders.repository.interface';

@Table({ tableName: 'company_order_schedule', timestamps: true })
export class CompanyOrderScheduleEntity extends Model {
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
    field: 'companyId',
  })
  companyId: number;

  @Column({
    type: DataType.ENUM(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ),
    allowNull: false,
    field: 'dayOfWeek',
  })
  dayOfWeek: DayOfWeek;

  @Column({
    type: DataType.STRING(5),
    allowNull: false,
    field: 'triggerTime',
  })
  triggerTime: string;

  @BelongsTo(() => CompanyEntity)
  company: CompanyEntity;
}
