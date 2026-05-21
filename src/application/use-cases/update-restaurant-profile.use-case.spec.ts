import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateRestaurantProfileUseCase } from './update-restaurant-profile.use-case';

describe('UpdateRestaurantProfileUseCase', () => {
  let restaurantRepo: any;
  let userRepo: any;
  let useCase: UpdateRestaurantProfileUseCase;

  const baseInput = {
    name: 'Sabores do Chef',
    cep: '12345-678',
    rua: 'Rua A',
    cidade: 'São Paulo',
    estado: 'SP',
    number: '123',
    complemento: 'Sala 1',
    phone: '(11) 99999-9999',
  };

  beforeEach(() => {
    restaurantRepo = {
      getById: jest.fn(),
      update: jest.fn(),
    };
    userRepo = {
      getById: jest.fn(),
      updateImage: jest.fn(),
    };
    useCase = new UpdateRestaurantProfileUseCase(restaurantRepo, userRepo);
  });

  it('lança BadRequest quando o cliente tenta alterar o CNPJ', async () => {
    await expect(
      useCase.execute(1, { ...baseInput, cnpj: '00.000.000/0000-00' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(restaurantRepo.getById).not.toHaveBeenCalled();
  });

  it('lança BadRequest quando o cliente tenta alterar o e-mail neste endpoint', async () => {
    await expect(
      useCase.execute(1, { ...baseInput, email: 'novo@x.com' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança NotFound quando o restaurante não existe', async () => {
    restaurantRepo.getById.mockResolvedValue(null);
    await expect(useCase.execute(1, baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('atualiza apenas os campos permitidos no restaurante', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 1, userId: 10 });
    restaurantRepo.update.mockResolvedValue({
      id: 1,
      userId: 10,
      name: baseInput.name,
      cnpj: '12.345.678/0001-90',
      cep: baseInput.cep,
      rua: baseInput.rua,
      cidade: baseInput.cidade,
      estado: baseInput.estado,
      number: baseInput.number,
      complemento: baseInput.complemento,
      phone: baseInput.phone,
    });
    userRepo.getById.mockResolvedValue({
      id: 10,
      email: 'atual@x.com',
      profileImage: 'old.jpg',
    });

    const result = await useCase.execute(1, baseInput);

    expect(restaurantRepo.update).toHaveBeenCalledWith(1, {
      name: baseInput.name,
      cep: baseInput.cep,
      rua: baseInput.rua,
      cidade: baseInput.cidade,
      estado: baseInput.estado,
      number: baseInput.number,
      complemento: baseInput.complemento,
      phone: baseInput.phone,
    });
    expect(userRepo.updateImage).not.toHaveBeenCalled();
    expect(result.email).toBe('atual@x.com');
    expect(result.cnpj).toBe('12.345.678/0001-90');
    expect(result.phone).toBe(baseInput.phone);
  });

  it('atualiza a profileImage no usuário quando fornecida', async () => {
    restaurantRepo.getById.mockResolvedValue({ id: 1, userId: 10 });
    restaurantRepo.update.mockResolvedValue({
      id: 1,
      userId: 10,
      name: baseInput.name,
      cnpj: '12.345.678/0001-90',
      cep: baseInput.cep,
      rua: baseInput.rua,
      cidade: baseInput.cidade,
      estado: baseInput.estado,
      number: baseInput.number,
      complemento: baseInput.complemento,
      phone: baseInput.phone,
    });
    userRepo.updateImage.mockResolvedValue({ id: 10 });
    userRepo.getById.mockResolvedValue({
      id: 10,
      email: 'atual@x.com',
      profileImage: 'old.jpg',
    });

    const result = await useCase.execute(1, {
      ...baseInput,
      profileImage: 'novo.jpg',
    });

    expect(userRepo.updateImage).toHaveBeenCalledWith(10, {
      profileImage: 'novo.jpg',
    });
    expect(result.profileImage).toBe('novo.jpg');
  });
});
