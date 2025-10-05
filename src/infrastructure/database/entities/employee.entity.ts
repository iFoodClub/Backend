import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { UserEntity } from './user.entity';
import { CompanyEntity } from './company.entity';
import { EmployeeWeeklyOrdersEntity } from './employee-weekly-orders.entity';
import { IndividualOrderEntity } from './individual-order.entity';

@Table({ tableName: 'employee', timestamps: false })
export class EmployeeEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'userId',
  })
  userId: number;

  @ForeignKey(() => CompanyEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'companyId',
  })
  companyId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(14),
    allowNull: false,
    unique: true,
  })
  cpf: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'birthDate',
  })
  birthDate: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'vacation',
    defaultValue: false,
  })
  vacation: boolean;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @BelongsTo(() => CompanyEntity)
  company: CompanyEntity;

  @HasMany(() => IndividualOrderEntity)
  individualOrders: IndividualOrderEntity[];
}