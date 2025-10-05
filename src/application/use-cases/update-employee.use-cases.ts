import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EmployeeInterface } from '../../domain/models/employee.model';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository
  ) {}
  async execute(id: number, employeeData: EmployeeInterface): Promise<EmployeeInterface> {
    if(employeeData.profileImage){
      const user = await this.userRepository.updateImage(employeeData.userId, {profileImage: employeeData.profileImage});
      if(!user){
        throw new BadRequestException('Usuário não encontrado');
      }
    }
    const employee = await this.employeeRepository.update(id, employeeData);
    return {
      id: employee.id,
      userId: employee.userId,
      companyId: employee.companyId,
      name: employee.name,
      cpf: employee.cpf,
      birthDate: employee.birthDate,
      vacation: employee.vacation,
      profileImage: employeeData.profileImage
    };
  }
}