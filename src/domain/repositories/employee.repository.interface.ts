import { EmployeeWeeklyOrdersEntityInterface } from "./employee-weekly-orders.repository.interface";
import { IndividualOrderEntityInterface } from "./individual-order.repository.interface";

export interface EmployeeEntityInterface {
  id: number;
  userId: number;
  companyId: number;
  name: string;
  cpf: string;
  birthDate: Date;
  vacation: boolean;
  individualOrders?: IndividualOrderEntityInterface[];
}