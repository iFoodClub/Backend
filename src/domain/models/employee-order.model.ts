export interface IEmployeeOrder {
  id: number;
  status: 'Preparando' | 'Concluido';
  employee: {
    name: string;
    id: number;
    image: string;
  };
  dish: {
    name: string;
    id: number;
    image: string;
    restaurantId: number;
    price: number;
  };
} 