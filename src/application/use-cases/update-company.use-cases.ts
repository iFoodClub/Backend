import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { CompanyEntityInterface } from "../../domain/repositories/company.repository.interface";
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { validateCNPJ } from '../../domain/utils/cnpj-validator';

@Injectable()
export class UpdateCompanyService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository,
        private readonly userRepository: UserRepository
    ) {}

    async execute(
        id: number,
        companyData: Partial<Omit<CompanyEntityInterface, 'id'>>
    ): Promise<CompanyEntityInterface> {
        if(companyData.profileImage){
            const user = await this.userRepository.updateImage(companyData.userId, {profileImage: companyData.profileImage});
            if(!user){
                throw new BadRequestException('Usuário não encontrado');
            }
        }
        if (companyData.userId) {
            const user = await this.userRepository.getById(companyData.userId);
            if (!user) {
                throw new BadRequestException('Usuário não encontrado');
            }
        }

        if (companyData.cnpj) {
            // if (!validateCNPJ(companyData.cnpj)) {
            //     throw new BadRequestException('CNPJ inválido');
            // }

            const existingCompany = await this.companyRepository.findByCnpj(companyData.cnpj);
            if (existingCompany && existingCompany.id !== id) {
                throw new BadRequestException('Já existe uma empresa cadastrada com este CNPJ');
            }
        }

        const company = await this.companyRepository.update(id, companyData);
        return {
            id: company.id,
            userId: company.userId,
            name: company.name,
            cnpj: company.cnpj,
            cep: company.cep,
            number: company.number,
            restaurantId: company.restaurantId,
            profileImage: companyData.profileImage
        }
    }
}