import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { CompanyEntityInterface } from "../../domain/repositories/company.repository.interface";
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { UserType } from 'src/domain/repositories/user.repository.interface';
import { UserProfileEligibilityService } from './user-profile-eligibility.service';

@Injectable()
export class CreateCompanyService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository,
        @Inject('USER_REPOSITORY')
        private readonly userRepository: UserRepository,
        private readonly userProfileEligibilityService: UserProfileEligibilityService,
    ) {}

    async execute(company: CompanyEntityInterface): Promise<CompanyEntityInterface> {
        const { userId } = company;

        await this.userProfileEligibilityService.assertEligibleForProfile(
            userId,
            UserType.COMPANY,
        );

        if (company.profileImage) {
            const updated = await this.userRepository.updateImage(userId, {
                profileImage: company.profileImage,
            });
            if (!updated) {
                throw new BadRequestException('Usuário não encontrado');
            }
        }

        const validate = await this.validateUserCreateCompany(company);
        if(!validate){
            throw new BadRequestException('Já existe uma empresa cadastrada com este CNPJ');
        }

        const companyCreated = await this.companyRepository.create(company);
        return {
            id: companyCreated.id,
            userId: companyCreated.userId,
            name: companyCreated.name,
            cnpj: companyCreated.cnpj,
            cep: companyCreated.cep,
            number: companyCreated.number,
            restaurantId: companyCreated.restaurantId,
            profileImage: company.profileImage
        }
    }

    async validateUserCreateCompany(company: CompanyEntityInterface): Promise<boolean> {
        const companies = await this.companyRepository.list();
        const existingCompany = companies.find(c => c.cnpj === company.cnpj);
        if(existingCompany){
            return false;
        }
        return true;
    }
}
