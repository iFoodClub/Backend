import { IndividualOrderEntityInterface } from "./individual-order.repository.interface";

export enum CompanyOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

export interface CompanyOrderEntityInterface {
  id: number;
  companyId: number;
  restaurantId: number;
  status: CompanyOrderStatus;
  collaboratorsOrders?: IndividualOrderEntityInterface[];
}