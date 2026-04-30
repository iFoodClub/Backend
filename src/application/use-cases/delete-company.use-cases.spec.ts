import { DeleteCompanyService } from './delete-company.use-cases';

describe('DeleteCompanyService', () => {
  it('delega o delete para o repositório com o id recebido', async () => {
    const companyRepository = { delete: jest.fn().mockResolvedValue(undefined) };
    const service = new DeleteCompanyService(companyRepository as any);

    await service.execute(10);

    expect(companyRepository.delete).toHaveBeenCalledWith(10);
    expect(companyRepository.delete).toHaveBeenCalledTimes(1);
  });
});
