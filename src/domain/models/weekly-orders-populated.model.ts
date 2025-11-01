export interface IDRestaurant {
  id: number;
  name: string;
  profileImage: string;
}

export interface IDEmployee {
  id: number;
  name: string;
  profileImage: string;
}

export interface IDDish {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface IWeeklyOrder {
  id: number;
  employee: IDEmployee;
  order: IDDish;
}

export interface IEmployeeWithWeeklyOrders {
  id: number;
  dayOfWeek: string;
  restaurant: IDRestaurant;
  weeklyOrders: IWeeklyOrder[];
}
