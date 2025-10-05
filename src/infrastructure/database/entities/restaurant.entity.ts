import { Table, Model, Column, DataType, BelongsTo, HasMany, ForeignKey } from 'sequelize-typescript';
import { UserEntity } from './user.entity';
import { DishEntity } from './dish.entity';
import { CompanyOrderEntity } from './company-order.entity';
import { RestaurantRatingEntity } from './restaurant-rating.entity';

@Table({ tableName: 'restaurant', timestamps: false })
export class RestaurantEntity extends Model {
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
    type: DataType.STRING(200),
    allowNull: false,
  })
  rua: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  cidade: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
  })
  estado: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  number: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  complemento: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  image: string;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @HasMany(() => DishEntity)
  dishes: DishEntity[];

  @HasMany(() => CompanyOrderEntity)
  companyOrders: CompanyOrderEntity[];

  @HasMany(() => RestaurantRatingEntity)
  restaurantRatings: RestaurantRatingEntity[];
}