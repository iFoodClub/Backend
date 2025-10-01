import { CompanyEntityInterface } from "./company.repository.interface";
import { EmployeeEntityInterface } from "./employee.repository.interface";
import { RestaurantEntityInterface } from "./restaurant.repository.interface";

export enum UserType {
  COMPANY = 'company',
  EMPLOYEE = 'employee',
  RESTAURANT = 'restaurant',
}

export interface UserLoginEntityInterface {
  id: number;
  email: string;
  userType: UserType;
  verificationToken?: string;
  verificationTokenExpireAt?: Date;
  cpf?: string;
  cnpj?: string;
  profileImage?: string;
  name?: string;
  company?: CompanyEntityInterface;
  employee?: EmployeeEntityInterface;
  restaurant?: RestaurantEntityInterface;
}