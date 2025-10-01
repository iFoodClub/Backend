import { Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';

export interface EmployeeWithProfileImage {
  id: number;
  userId: number;
  companyId: number;
  name: string;
  cpf: string;
  birthDate: Date;
  vacation: boolean;
  profileImage?: string;
}

@Injectable()
export class ListEmployeesByCompanyService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(companyId: number): Promise<EmployeeWithProfileImage[]> {
    return await this.employeeRepository.listByCompanyWithProfileImage(companyId);
  }
} 