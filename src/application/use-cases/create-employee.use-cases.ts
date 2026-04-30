import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { EmployeeInterface } from "../../domain/models/employee.model";
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { UserRepository } from "src/infrastructure/database/repositories/user.repository";
import { UserType } from 'src/domain/repositories/user.repository.interface';
import { UserProfileEligibilityService } from './user-profile-eligibility.service';

@Injectable()
export class CreateEmployeeService {
    constructor(
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository,
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository,
        private readonly userProfileEligibilityService: UserProfileEligibilityService,
    ){}
    async execute(employee: EmployeeInterface): Promise<void> {
        await this.userProfileEligibilityService.assertEligibleForProfile(
            employee.userId,
            UserType.EMPLOYEE,
        );

        const validate = await this.validateUserCreateEmployee(employee);
        if(!validate){
            throw new BadRequestException('CPF já cadastrado');
        }
        await this.employeeRepository.create(employee);
        if (employee.profileImage) {
            await this.userRepository.updateImage(employee.userId, { profileImage: employee.profileImage });
        }
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
