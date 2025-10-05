import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { IndividualOrderEntity } from './individual-order.entity';
import { DishEntity } from './dish.entity';

@Table({ 
  tableName: 'order_item', 
  timestamps: false,
  underscored: true
})
export class OrderItemEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  id: number;

  @ForeignKey(() => DishEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'dishId',
  })
  dishId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;

  @BelongsTo(() => DishEntity, {
    foreignKey: 'dishId',
    as: 'dish'
  })
  dish: DishEntity;
}