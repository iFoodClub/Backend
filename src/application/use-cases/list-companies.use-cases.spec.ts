import { ListCompaniesService } from './list-companies.use-cases';

describe('ListCompaniesService', () => {
  it('retorna a lista vinda do repositório', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    const repo = { list: jest.fn().mockResolvedValue(data) };
    const service = new ListCompaniesService(repo as any);

    await expect(service.execute()).resolves.toBe(data);
  });
});
