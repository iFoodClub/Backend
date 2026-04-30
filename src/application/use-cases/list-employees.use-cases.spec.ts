import { ListEmployeesService } from './list-employees.use-cases';

describe('ListEmployeesService', () => {
  it('retorna a lista vinda do EmployeeRepository', async () => {
    const data = [{ id: 1 }];
    const repo = { list: jest.fn().mockResolvedValue(data) };
    const service = new ListEmployeesService(repo as any);

    await expect(service.execute()).resolves.toBe(data);
  });
});
