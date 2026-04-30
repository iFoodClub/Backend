import { BadRequestException } from '@nestjs/common';
import { UpdateEmployeeService } from './update-employee.use-cases';

describe('UpdateEmployeeService', () => {
  let employeeRepo: any;
  let userRepo: any;
  let service: UpdateEmployeeService;

  beforeEach(() => {
    employeeRepo = { update: jest.fn() };
    userRepo = { updateImage: jest.fn() };
    service = new UpdateEmployeeService(employeeRepo, userRepo);
  });

  it('atualiza apenas o employee quando não há profileImage', async () => {
    employeeRepo.update.mockResolvedValue({
      id: 1,
      userId: 2,
      companyId: 3,
      name: 'Jo',
      cpf: '111',
      birthDate: new Date('2000-01-01'),
      vacation: false,
    });

    const result = await service.execute(1, {
      name: 'Jo',
    } as any);

    expect(userRepo.updateImage).not.toHaveBeenCalled();
    expect(employeeRepo.update).toHaveBeenCalledWith(1, { name: 'Jo' });
    expect(result).toMatchObject({ id: 1, name: 'Jo', profileImage: undefined });
  });

  it('atualiza a imagem do user quando profileImage é fornecido', async () => {
    userRepo.updateImage.mockResolvedValue({ id: 2 });
    employeeRepo.update.mockResolvedValue({
      id: 1,
      userId: 2,
      companyId: 3,
      name: 'Jo',
      cpf: '111',
      birthDate: new Date('2000-01-01'),
      vacation: false,
    });

    const result = await service.execute(1, {
      userId: 2,
      profileImage: 'img.png',
    } as any);

    expect(userRepo.updateImage).toHaveBeenCalledWith(2, {
      profileImage: 'img.png',
    });
    expect(result.profileImage).toBe('img.png');
  });

  it('lança BadRequestException quando updateImage do user falha', async () => {
    userRepo.updateImage.mockResolvedValue(null);

    await expect(
      service.execute(1, { userId: 2, profileImage: 'x' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(employeeRepo.update).not.toHaveBeenCalled();
  });
});
