import { DeleteRestaurantService } from './delete-restaurant.use-cases';

describe('DeleteRestaurantService', () => {
  it('delega o delete para o RestaurantRepository', () => {
    const restaurantRepository = { delete: jest.fn() };
    const service = new DeleteRestaurantService(restaurantRepository as any);

    service.execute(7);

    expect(restaurantRepository.delete).toHaveBeenCalledWith(7);
  });
});
