import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { EmployeeInterface } from "../../domain/models/employee.model";
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { UserRepository } from "src/infrastructure/database/repositories/user.repository";

@Injectable()
export class CreateEmployeeService {
    constructor(
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository,
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository
    ){}
    async execute(employee: EmployeeInterface): Promise<void> {
        const validate = await this.validateUserCreateEmployee(employee);
        if(!validate){
            throw new BadRequestException('CPF já cadastrado');
        }
        this.employeeRepository.create(employee);
        this.userRepository.updateImage(employee.userId, {profileImage: employee.profileImage});
    }

    async validateUserCreateEmployee(employee: EmployeeInterface): Promise<boolean> {
        const employees = await this.employeeRepository.list();
        const existingEmployee = employees.find(e => e.cpf === employee.cpf);
        if(existingEmployee){
            return false;
        }
        return true;
    }
}