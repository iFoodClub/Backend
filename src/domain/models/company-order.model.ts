import { IEmployeeOrder } from "src/domain/models/employee-order.model";

export interface ICompanyOrder {
  id: number;
  code: string;
  totalPrice: number;
  status: 'Enviado' | 'Entregue' | 'Cancelado' | 'Preparando';
  restaurantId: number;
  company: {
    name: string;
    id: number;
    image: string;
  };
  employeeOrders: IEmployeeOrder[];
} 