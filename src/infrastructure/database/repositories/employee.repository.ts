import { Inject, Injectable } from '@nestjs/common';
import { EmployeeEntity } from '../entities/employee.entity';
import { EmployeeEntityInterface } from '../../../domain/repositories/employee.repository.interface';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class EmployeeRepository {
  constructor(
    @Inject('EMPLOYEE_ENTITY')
    private readonly employeeEntity: typeof EmployeeEntity,
    @Inject('USER_ENTITY')
    private readonly userEntity: typeof UserEntity,
  ) {}

  async list(): Promise<EmployeeEntityInterface[]> {
    return await this.employeeEntity.findAll({
    });
  }
  async create(employee: Omit<EmployeeEntityInterface, 'id'>): Promise<EmployeeEntityInterface> {
    return await this.employeeEntity.create(employee);
  }

  async update(
    id: number,
    employeeData: Partial<Omit<EmployeeEntityInterface, 'id'>>,
  ): Promise<EmployeeEntityInterface> {
    const employee = await this.employeeEntity.findByPk(id);
    return await employee.update(employeeData);
  }

  async getById(id: number): Promise<EmployeeEntityInterface | null> {
    return await this.employeeEntity.findByPk(id, {
    });
  }
  async getByUserId(userId: number): Promise<EmployeeEntityInterface | null> {
    return await this.employeeEntity.findOne({ where: { userId } });
  }

  async listByCompany(companyId: number): Promise<EmployeeEntityInterface[]> {
    return await this.employeeEntity.findAll({ where: { companyId } });
  }

  async listByCompanyWithProfileImage(companyId: number): Promise<any[]> {
    const employees = await this.employeeEntity.findAll({
      where: { companyId },
      include: [
        {
          model: this.userEntity,
          as: 'user',
          attributes: ['profileImage'],
        },
      ],
      attributes: ['id', 'userId', 'companyId', 'name', 'cpf', 'birthDate', 'vacation'],
    });

    return employees.map(employee => ({
      id: employee.id,
      userId: employee.userId,
      companyId: employee.companyId,
      name: employee.name,
      cpf: employee.cpf,
      birthDate: employee.birthDate,
      vacation: employee.vacation,
      profileImage: employee.user?.profileImage || null,
    }));
  }

  async delete(id: number): Promise<void> {
    const employee = await this.employeeEntity.findByPk(id);
    await employee.destroy();
  }

  async findByCpf(cpf: string): Promise<EmployeeEntityInterface | null> {
    return await this.employeeEntity.findOne({ where: { cpf } });
  }

  async findByUserId(userId: number): Promise<EmployeeEntityInterface | null> {
    return await this.employeeEntity.findOne({ where: { userId } });
  }
}