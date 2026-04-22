import { ListEmployeesByCompanyService } from './list-employees-by-company.use-cases';

describe('ListEmployeesByCompanyService', () => {
  it('delega listByCompanyWithProfileImage usando o companyId', async () => {
    const data = [{ id: 1, companyId: 10 }];
    const repo = {
      listByCompanyWithProfileImage: jest.fn().mockResolvedValue(data),
    };
    const service = new ListEmployeesByCompanyService(repo as any);

    await expect(service.execute(10)).resolves.toBe(data);
    expect(repo.listByCompanyWithProfileImage).toHaveBeenCalledWith(10);
  });
});
