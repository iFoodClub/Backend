import { DishEntityInterface } from "./dish.repository.interface";
import { IndividualOrderEntityInterface } from "./individual-order.repository.interface";
import { OrderItemEntityInterface } from "./order-item.repository.interface";

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface EmployeeWeeklyOrdersEntityInterface {
  id: number;
  employeeId: number;
  dayOfWeek: DayOfWeek;
  orderItemId: number;
  order?: OrderItemEntityInterface;
  dish?: DishEntityInterface;
}