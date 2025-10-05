import { CompanyAffiliateRestaurantEntityInterface } from "src/domain/repositories/company-affiliate-restaurant.repository.interface";
import { EmployeeEntityInterface } from "src/domain/repositories/employee.repository.interface";

export interface CompanyInterface {
  id: number;
  userId: number;
  restaurantId?: number | null;
  name: string;
  cnpj: string;
  cep: string;
  number: string;
  employees?: EmployeeEntityInterface[];
  affiliateRestaurants?: CompanyAffiliateRestaurantEntityInterface[];
}
