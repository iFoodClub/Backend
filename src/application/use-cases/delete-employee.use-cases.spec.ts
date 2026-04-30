import { DeleteEmployeeService } from './delete-employee.use-cases';

describe('DeleteEmployeeService', () => {
  it('delega o delete para o EmployeeRepository', async () => {
    const employeeRepository = { delete: jest.fn().mockResolvedValue(undefined) };
    const service = new DeleteEmployeeService(employeeRepository as any);

    await service.execute(3);

    expect(employeeRepository.delete).toHaveBeenCalledWith(3);
  });
});
