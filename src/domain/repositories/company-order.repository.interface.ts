import { IndividualOrderEntityInterface } from './individual-order.repository.interface';

export enum CompanyOrderStatus {
  PENDING = 'pending',
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  ORDERED = 'ordered',
  PREPARING = 'preparing',
  INPROGRESS = 'inProgress',
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
