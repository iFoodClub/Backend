import { IndividualOrderEntityInterface } from './individual-order.repository.interface';

export enum CompanyOrderStatus {
  CREATED = 'created',
  ORDERED = 'ordered',
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
