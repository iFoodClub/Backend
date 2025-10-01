import { EmployeeWeeklyOrdersEntityInterface } from "src/domain/repositories/employee-weekly-orders.repository.interface";
import { IndividualOrderEntityInterface } from "src/domain/repositories/individual-order.repository.interface";

export interface EmployeeInterface {
    id: number;
    userId: number;
    companyId: number;
    name: string;
    cpf: string;
    birthDate: Date;
    vacation: boolean;
    individualOrders?: IndividualOrderEntityInterface[];
    profileImage?: string;
}