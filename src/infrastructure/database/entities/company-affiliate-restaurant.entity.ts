import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { CompanyEntity } from './company.entity';
import { RestaurantEntity } from './restaurant.entity';

@Table({ tableName: 'company_affiliate_restaurants', timestamps: false })
export class CompanyAffiliateRestaurantEntity extends Model {
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
    field: 'company_id',
  })
  companyId: number;

  @ForeignKey(() => RestaurantEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'restaurant_id',
  })
  restaurantId: number;

  @BelongsTo(() => CompanyEntity)
  company: CompanyEntity;

  @BelongsTo(() => RestaurantEntity)
  restaurant: RestaurantEntity;
}