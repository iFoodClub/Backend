import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserEntity } from './user.entity';
import { RestaurantEntity } from './restaurant.entity';

@Table({ tableName: 'favorite_restaurant', timestamps: true })
export class FavoriteRestaurantEntity extends Model {
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

  @ForeignKey(() => RestaurantEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'restaurantId',
  })
  restaurantId: number;

  @BelongsTo(() => UserEntity)
  user: UserEntity;

  @BelongsTo(() => RestaurantEntity)
  restaurant: RestaurantEntity;
}
