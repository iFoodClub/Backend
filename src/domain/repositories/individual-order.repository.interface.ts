import { OrderItemEntityInterface } from "./order-item.repository.interface";

export enum IndividualOrderStatus {
  PREPARING = 'preparing',
  COMPLETED = 'completed',
}

export interface IndividualOrderEntityInterface {
  id: number;
  companyOrderId?: number;
  companyId?: number;
  employeeId: number;
  dishId?: number;
  restaurantId?: number;
  status: IndividualOrderStatus;
}