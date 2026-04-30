import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GetUserByIdService } from './get-user-byid.use-cases';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';

describe('GetUserByIdService', () => {
  let service: GetUserByIdService;
  let userRepository: { getById: jest.Mock };

  beforeEach(async () => {
    userRepository = { getById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserByIdService,
        { provide: 'USER_REPOSITORY', useValue: userRepository },
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    service = moduleRef.get(GetUserByIdService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('retorna o usuário mapeado quando encontrado', async () => {
    userRepository.getById.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      userType: 'employee',
      profileImage: 'img.png',
      password: 'hashed',
      name: 'User',
    });

    const result = await service.execute(1);

    expect(userRepository.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      email: 'user@test.com',
      userType: 'employee',
      profileImage: 'img.png',
    });
  });

  it('lança NotFoundException quando o usuário não existe', async () => {
    userRepository.getById.mockResolvedValue(null);

    await expect(service.execute(99)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.execute(99)).rejects.toMatchObject({
      message: 'Usuário não encontrado',
    });
  });
});
