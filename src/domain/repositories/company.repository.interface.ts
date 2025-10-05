import { CompanyAffiliateRestaurantEntityInterface } from "./company-affiliate-restaurant.repository.interface";
import { EmployeeEntityInterface } from "./employee.repository.interface";

export interface CompanyEntityInterface {
  id: number;
  userId: number;
  restaurantId?: number;
  name: string;
  cnpj: string;
  cep: string;
  number: string;
  employees?: EmployeeEntityInterface[];
  affiliateRestaurants?: CompanyAffiliateRestaurantEntityInterface[];
  profileImage?: string;
}