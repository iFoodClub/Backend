import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { UserType } from 'src/domain/repositories/user.repository.interface';

/**
 * Garante que um mesmo login (userId) só tenha um perfil de negócio:
 * empresa OU funcionário OU restaurante — nunca mais de um.
 */
@Injectable()
export class UserProfileEligibilityService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: UserRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
    @Inject('EMPLOYEE_REPOSITORY')
    private readonly employeeRepository: EmployeeRepository,
    @Inject('RESTAURANT_REPOSITORY')
    private readonly restaurantRepository: RestaurantRepository,
  ) {}

  async assertEligibleForProfile(
    userId: number,
    expectedType: UserType,
  ): Promise<void> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.userType !== expectedType) {
      const label: Record<UserType, string> = {
        [UserType.COMPANY]: 'empresa',
        [UserType.EMPLOYEE]: 'funcionário',
        [UserType.RESTAURANT]: 'restaurante',
      };
      throw new BadRequestException(
        `Apenas usuários do tipo ${label[expectedType]} podem ter este cadastro vinculado.`,
      );
    }

    const company = await this.companyRepository.findByUserId(userId);
    if (company) {
      if (expectedType === UserType.COMPANY) {
        throw new BadRequestException(
          'Este usuário já possui uma empresa vinculada. Um login não pode estar associado a mais de uma empresa.',
        );
      }
      throw new BadRequestException(
        'Este usuário já possui cadastro de empresa. O mesmo login não pode acumular empresa e outro perfil.',
      );
    }

    const employee = await this.employeeRepository.findByUserId(userId);
    if (employee) {
      if (expectedType === UserType.EMPLOYEE) {
        throw new BadRequestException(
          'Este usuário já possui cadastro de funcionário. Um login não pode estar associado a mais de um perfil de funcionário.',
        );
      }
      throw new BadRequestException(
        'Este usuário já possui cadastro de funcionário. O mesmo login não pode acumular funcionário e outro perfil.',
      );
    }

    const restaurant = await this.restaurantRepository.findByUserId(userId);
    if (restaurant) {
      if (expectedType === UserType.RESTAURANT) {
        throw new BadRequestException(
          'Este usuário já possui cadastro de restaurante. Um login não pode estar associado a mais de um restaurante.',
        );
      }
      throw new BadRequestException(
        'Este usuário já possui cadastro de restaurante. O mesmo login não pode acumular restaurante e outro perfil.',
      );
    }
  }
}
