import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { RestaurantEntity } from './restaurant.entity';
import { UserEntity } from './user.entity';

@Table({ tableName: 'restaurant_rating', timestamps: false })
export class RestaurantRatingEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => RestaurantEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'restaurantId',
  })
  restaurantId: number;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'userId',
  })
  userId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @BelongsTo(() => RestaurantEntity, {
    foreignKey: 'restaurantId'
  })
  restaurant: RestaurantEntity;

  @BelongsTo(() => UserEntity, {
    foreignKey: 'userId'
  })
  user: UserEntity;
} 