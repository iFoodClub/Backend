import { BadRequestException } from '@nestjs/common';
import { UpdateCompanyService } from './update-company.use-cases';

describe('UpdateCompanyService', () => {
  let companyRepo: any;
  let userRepo: any;
  let service: UpdateCompanyService;

  const fullCompany = {
    id: 1,
    userId: 2,
    name: 'C',
    cnpj: '111',
    cep: '00',
    number: '1',
    restaurantId: null,
  };

  beforeEach(() => {
    companyRepo = {
      update: jest.fn().mockResolvedValue(fullCompany),
      findByCnpj: jest.fn(),
    };
    userRepo = { updateImage: jest.fn(), getById: jest.fn() };
    service = new UpdateCompanyService(companyRepo, userRepo);
  });

  it('atualiza com payload mínimo (sem tocar user, sem validar cnpj)', async () => {
    const result = await service.execute(1, { name: 'C' } as any);

    expect(userRepo.updateImage).not.toHaveBeenCalled();
    expect(userRepo.getById).not.toHaveBeenCalled();
    expect(companyRepo.findByCnpj).not.toHaveBeenCalled();
    expect(companyRepo.update).toHaveBeenCalledWith(1, { name: 'C' });
    expect(result.id).toBe(1);
  });

  it('atualiza profileImage do user quando fornecido', async () => {
    userRepo.updateImage.mockResolvedValue({ id: 2 });
    userRepo.getById.mockResolvedValue({ id: 2 });

    const result = await service.execute(1, {
      userId: 2,
      profileImage: 'img.png',
    } as any);

    expect(userRepo.updateImage).toHaveBeenCalledWith(2, {
      profileImage: 'img.png',
    });
    expect(result.profileImage).toBe('img.png');
  });

  it('lança BadRequestException quando updateImage retorna null', async () => {
    userRepo.updateImage.mockResolvedValue(null);

    await expect(
      service.execute(1, { userId: 2, profileImage: 'x' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lança BadRequestException quando o user vinculado não existe', async () => {
    userRepo.getById.mockResolvedValue(null);

    await expect(
      service.execute(1, { userId: 999 } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('permite atualizar quando o CNPJ já pertence à mesma company', async () => {
    userRepo.getById.mockResolvedValue({ id: 2 });
    companyRepo.findByCnpj.mockResolvedValue({ id: 1, cnpj: '111' });

    await expect(
      service.execute(1, { userId: 2, cnpj: '111' } as any),
    ).resolves.toBeDefined();
  });

  it('lança BadRequestException quando o CNPJ já pertence a outra company', async () => {
    userRepo.getById.mockResolvedValue({ id: 2 });
    companyRepo.findByCnpj.mockResolvedValue({ id: 42, cnpj: '111' });

    await expect(
      service.execute(1, { userId: 2, cnpj: '111' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
