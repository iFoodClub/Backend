import { BadRequestException } from '@nestjs/common';
import { UpdateRestaurantService } from './update-restaurant.use-cases';

describe('UpdateRestaurantService', () => {
  let restaurantRepo: any;
  let userRepo: any;
  let service: UpdateRestaurantService;

  const fullRestaurant = {
    id: 1,
    userId: 2,
    name: 'R',
    cnpj: '00',
    cep: '00',
    rua: 'rua',
    cidade: 'c',
    estado: 's',
    number: '10',
    complemento: 'apt',
  };

  beforeEach(() => {
    restaurantRepo = { update: jest.fn().mockResolvedValue(fullRestaurant) };
    userRepo = { updateImage: jest.fn() };
    service = new UpdateRestaurantService(restaurantRepo, userRepo);
  });

  it('atualiza sem tocar no user quando não há profileImage', async () => {
    const result = await service.execute(1, { name: 'R' } as any);

    expect(userRepo.updateImage).not.toHaveBeenCalled();
    expect(restaurantRepo.update).toHaveBeenCalledWith(1, { name: 'R' });
    expect(result.profileImage).toBeUndefined();
  });

  it('propaga profileImage para o user quando fornecido', async () => {
    userRepo.updateImage.mockResolvedValue({ id: 2 });

    const result = await service.execute(1, {
      userId: 2,
      profileImage: 'img.png',
    } as any);

    expect(userRepo.updateImage).toHaveBeenCalledWith(2, {
      profileImage: 'img.png',
    });
    expect(result.profileImage).toBe('img.png');
  });

  it('lança BadRequestException quando o user não é encontrado na atualização de imagem', async () => {
    userRepo.updateImage.mockResolvedValue(null);

    await expect(
      service.execute(1, { userId: 2, profileImage: 'x' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
