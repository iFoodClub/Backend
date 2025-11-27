import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { EmployeeRepository } from '../../infrastructure/database/repositories/employee.repository';
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from '../../infrastructure/database/repositories/restaurant.repository';
import { EmployeeWeeklyOrdersRepository } from '../../infrastructure/database/repositories/employee-weekly-orders.repository';
import { IndividualOrderRepository } from '../../infrastructure/database/repositories/individual-order.repository';

@Injectable()
export class DeleteUserService {
    constructor(
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository,
        @Inject('EMPLOYEE_REPOSITORY')
        private readonly employeeRepository: EmployeeRepository,
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository,
        @Inject('RESTAURANT_REPOSITORY')
        private readonly restaurantRepository: RestaurantRepository,
        @Inject('EMPLOYEE_WEEKLY_ORDERS_REPOSITORY')
        private readonly employeeWeeklyOrdersRepository: EmployeeWeeklyOrdersRepository,
        @Inject('INDIVIDUAL_ORDER_REPOSITORY')
        private readonly individualOrderRepository: IndividualOrderRepository,
    ) {}

    async execute(id: number): Promise<void> {
        // Verificar se o usuário existe
        const user = await this.userRepository.getById(id);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // 1. Deletar Employee e seus relacionamentos (se existir)
        const employee = await this.employeeRepository.findByUserId(id);
        if (employee) {
            // Deletar pedidos semanais do funcionário
            const weeklyOrders = await this.employeeWeeklyOrdersRepository.findByEmployeeId(employee.id);
            for (const weeklyOrder of weeklyOrders) {
                await this.employeeWeeklyOrdersRepository.delete(weeklyOrder.id);
            }

            // Deletar pedidos individuais do funcionário
            const individualOrders = await this.individualOrderRepository.listByEmployee(employee.id);
            for (const order of individualOrders) {
                await this.individualOrderRepository.delete(order.id);
            }

            // Deletar employee
            await this.employeeRepository.delete(employee.id);
        }

        // 2. Deletar Company (se existir)
        const company = await this.companyRepository.findByUserId(id);
        if (company) {
            // Nota: Funcionários da empresa já foram tratados acima
            // ou deveriam ter sido migrados para outra empresa
            await this.companyRepository.delete(company.id);
        }

        // 3. Deletar Restaurant (se existir)
        const restaurant = await this.restaurantRepository.findByUserId(id);
        if (restaurant) {
            // Nota: Pratos do restaurante devem ser deletados manualmente antes
            // ou você pode adicionar lógica aqui para deletá-los
            await this.restaurantRepository.delete(restaurant.id);
        }

        // 4. Finalmente, deletar o usuário
        await this.userRepository.delete(id);
    }
}