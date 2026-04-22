import { GetCompanyByIdService } from './get-company-byid.use-cases';

describe('GetCompanyByIdService', () => {
  it('retorna a company do repositório', async () => {
    const repo = { getById: jest.fn().mockResolvedValue({ id: 1, name: 'X' }) };
    const service = new GetCompanyByIdService(repo as any);

    const result = await service.execute(1);

    expect(repo.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'X' });
  });

  it('retorna null quando não existe', async () => {
    const repo = { getById: jest.fn().mockResolvedValue(null) };
    const service = new GetCompanyByIdService(repo as any);

    await expect(service.execute(99)).resolves.toBeNull();
  });
});
