import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { UserEntity } from './user.entity';
import { EmployeeEntity } from './employee.entity';
import { CompanyAffiliateRestaurantEntity } from './company-affiliate-restaurant.entity';
import { RestaurantEntity } from './restaurant.entity';

@Table({ tableName: 'company', timestamps: false })
export class CompanyEntity extends Model {
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

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
  })
  cnpj: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  cep: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  number: string;

  @ForeignKey(() => RestaurantEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'restaurantId',
  })
  restaurantId: number;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @HasMany(() => EmployeeEntity)
  employees: EmployeeEntity[];

  @HasMany(() => CompanyAffiliateRestaurantEntity)
  affiliateRestaurants: CompanyAffiliateRestaurantEntity[];
}