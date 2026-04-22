import { BadRequestException } from '@nestjs/common';
import { CreateEmployeeService } from './create-employee.use-cases';

describe('CreateEmployeeService', () => {
  let employeeRepo: any;
  let userRepo: any;
  let eligibility: any;
  let service: CreateEmployeeService;

  const baseEmployee = { userId: 2, name: 'J', cpf: '111' };

  beforeEach(() => {
    employeeRepo = { list: jest.fn().mockResolvedValue([]), create: jest.fn() };
    userRepo = { updateImage: jest.fn() };
    eligibility = { assertEligibleForProfile: jest.fn() };
    service = new CreateEmployeeService(employeeRepo, userRepo, eligibility);
  });

  it('cria employee quando elegível e CPF não duplica', async () => {
    await service.execute(baseEmployee as any);

    expect(eligibility.assertEligibleForProfile).toHaveBeenCalledWith(
      2,
      'employee',
    );
    expect(employeeRepo.create).toHaveBeenCalled();
  });

  it('atualiza imagem do user quando profileImage é enviado', async () => {
    await service.execute({ ...baseEmployee, profileImage: 'img.png' } as any);

    expect(userRepo.updateImage).toHaveBeenCalledWith(2, {
      profileImage: 'img.png',
    });
  });

  it('lança BadRequestException quando o CPF já existe', async () => {
    employeeRepo.list.mockResolvedValue([{ cpf: '111' }]);

    await expect(service.execute(baseEmployee as any)).rejects.toMatchObject({
      message: expect.stringContaining('CPF'),
    });
    expect(employeeRepo.create).not.toHaveBeenCalled();
  });

  describe('validateUserCreateEmployee', () => {
    it('retorna true quando não há duplicidade', async () => {
      employeeRepo.list.mockResolvedValue([{ cpf: '222' }]);

      await expect(
        service.validateUserCreateEmployee({ cpf: '111' } as any),
      ).resolves.toBe(true);
    });

    it('retorna false quando o CPF já existe', async () => {
      employeeRepo.list.mockResolvedValue([{ cpf: '111' }]);

      await expect(
        service.validateUserCreateEmployee({ cpf: '111' } as any),
      ).resolves.toBe(false);
    });
  });
});
