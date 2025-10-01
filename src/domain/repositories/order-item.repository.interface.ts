import { IndividualOrderEntityInterface } from "./individual-order.repository.interface";

export interface OrderItemEntityInterface {
  id: number;
  dishId: number;
  quantity: number;
}