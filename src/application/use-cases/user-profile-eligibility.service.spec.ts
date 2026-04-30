import { BadRequestException } from '@nestjs/common';
import { UserProfileEligibilityService } from './user-profile-eligibility.service';
import { UserType } from '../../domain/repositories/user.repository.interface';

describe('UserProfileEligibilityService', () => {
  let userRepo: any;
  let companyRepo: any;
  let employeeRepo: any;
  let restaurantRepo: any;
  let service: UserProfileEligibilityService;

  beforeEach(() => {
    userRepo = { getById: jest.fn() };
    companyRepo = { findByUserId: jest.fn() };
    employeeRepo = { findByUserId: jest.fn() };
    restaurantRepo = { findByUserId: jest.fn() };
    service = new UserProfileEligibilityService(
      userRepo,
      companyRepo,
      employeeRepo,
      restaurantRepo,
    );
  });

  it('lança BadRequestException quando o usuário não existe', async () => {
    userRepo.getById.mockResolvedValue(null);

    await expect(
      service.assertEligibleForProfile(1, UserType.COMPANY),
    ).rejects.toMatchObject({ message: 'Usuário não encontrado' });
  });

  it('lança BadRequestException quando o userType do usuário não bate com o esperado', async () => {
    userRepo.getById.mockResolvedValue({ id: 1, userType: UserType.EMPLOYEE });

    await expect(
      service.assertEligibleForProfile(1, UserType.COMPANY),
    ).rejects.toMatchObject({
      message: expect.stringContaining('Apenas usuários do tipo empresa'),
    });
  });

  it('lança BadRequestException quando já existe company vinculada e o tipo esperado é COMPANY', async () => {
    userRepo.getById.mockResolvedValue({ id: 1, userType: UserType.COMPANY });
    companyRepo.findByUserId.mockResolvedValue({ id: 10 });

    await expect(
      service.assertEligibleForProfile(1, UserType.COMPANY),
    ).rejects.toMatchObject({
      message: expect.stringContaining('mais de uma empresa'),
    });
  });

  it('lança BadRequestException quando já existe employee e esperado é EMPLOYEE', async () => {
    userRepo.getById.mockResolvedValue({ id: 1, userType: UserType.EMPLOYEE });
    companyRepo.findByUserId.mockResolvedValue(null);
    employeeRepo.findByUserId.mockResolvedValue({ id: 10 });

    await expect(
      service.assertEligibleForProfile(1, UserType.EMPLOYEE),
    ).rejects.toMatchObject({
      message: expect.stringContaining('mais de um perfil de funcionário'),
    });
  });

  it('lança BadRequestException quando já existe restaurant e esperado é RESTAURANT', async () => {
    userRepo.getById.mockResolvedValue({ id: 1, userType: UserType.RESTAURANT });
    companyRepo.findByUserId.mockResolvedValue(null);
    employeeRepo.findByUserId.mockResolvedValue(null);
    restaurantRepo.findByUserId.mockResolvedValue({ id: 10 });

    await expect(
      service.assertEligibleForProfile(1, UserType.RESTAURANT),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('resolve sem erro quando o usuário existe, bate o tipo e não há perfis duplicados', async () => {
    userRepo.getById.mockResolvedValue({ id: 1, userType: UserType.COMPANY });
    companyRepo.findByUserId.mockResolvedValue(null);
    employeeRepo.findByUserId.mockResolvedValue(null);
    restaurantRepo.findByUserId.mockResolvedValue(null);

    await expect(
      service.assertEligibleForProfile(1, UserType.COMPANY),
    ).resolves.toBeUndefined();
  });
});
