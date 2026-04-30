import { BadRequestException } from '@nestjs/common';
import { CreateCompanyService } from './create-company.use-cases';

describe('CreateCompanyService', () => {
  let companyRepo: any;
  let userRepo: any;
  let eligibility: any;
  let service: CreateCompanyService;

  const baseCompany = {
    userId: 2,
    name: 'C',
    cnpj: '111',
    cep: '0',
    number: '1',
    restaurantId: null,
  };

  beforeEach(() => {
    companyRepo = {
      list: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    };
    userRepo = { updateImage: jest.fn() };
    eligibility = { assertEligibleForProfile: jest.fn() };
    service = new CreateCompanyService(companyRepo, userRepo, eligibility);
  });

  it('cria company quando elegível e CNPJ não duplica', async () => {
    companyRepo.create.mockResolvedValue({ ...baseCompany, id: 1 });

    const result = await service.execute(baseCompany as any);

    expect(eligibility.assertEligibleForProfile).toHaveBeenCalledWith(2, 'company');
    expect(companyRepo.create).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.profileImage).toBeUndefined();
  });

  it('atualiza imagem do user quando profileImage é enviado', async () => {
    userRepo.updateImage.mockResolvedValue({ id: 2 });
    companyRepo.create.mockResolvedValue({ ...baseCompany, id: 1 });

    await service.execute({ ...baseCompany, profileImage: 'img.png' } as any);

    expect(userRepo.updateImage).toHaveBeenCalledWith(2, {
      profileImage: 'img.png',
    });
  });

  it('lança BadRequestException quando updateImage retorna falsy', async () => {
    userRepo.updateImage.mockResolvedValue(null);

    await expect(
      service.execute({ ...baseCompany, profileImage: 'x' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança BadRequestException quando já existe company com o CNPJ', async () => {
    companyRepo.list.mockResolvedValue([{ id: 99, cnpj: '111' }]);

    await expect(service.execute(baseCompany as any)).rejects.toMatchObject({
      message: expect.stringContaining('CNPJ'),
    });
    expect(companyRepo.create).not.toHaveBeenCalled();
  });

  describe('validateUserCreateCompany', () => {
    it('retorna true quando não há duplicidade', async () => {
      companyRepo.list.mockResolvedValue([{ cnpj: '222' }]);

      await expect(
        service.validateUserCreateCompany({ cnpj: '111' } as any),
      ).resolves.toBe(true);
    });

    it('retorna false quando o CNPJ já existe', async () => {
      companyRepo.list.mockResolvedValue([{ cnpj: '111' }]);

      await expect(
        service.validateUserCreateCompany({ cnpj: '111' } as any),
      ).resolves.toBe(false);
    });
  });
});
