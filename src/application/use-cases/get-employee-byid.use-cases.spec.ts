import { GetEmployeeByIdService } from './get-employee-byid.use-cases';

describe('GetEmployeeByIdService', () => {
  it('retorna o employee do repositório', async () => {
    const repo = { getById: jest.fn().mockResolvedValue({ id: 5, name: 'Jo' }) };
    const service = new GetEmployeeByIdService(repo as any);

    await expect(service.execute(5)).resolves.toEqual({ id: 5, name: 'Jo' });
    expect(repo.getById).toHaveBeenCalledWith(5);
  });

  it('retorna null quando não encontra', async () => {
    const repo = { getById: jest.fn().mockResolvedValue(null) };
    const service = new GetEmployeeByIdService(repo as any);

    await expect(service.execute(404)).resolves.toBeNull();
  });
});
