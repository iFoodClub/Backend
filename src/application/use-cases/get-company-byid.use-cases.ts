import { Inject, Injectable } from "@nestjs/common";
import { CompanyEntityInterface } from "../../domain/repositories/company.repository.interface";
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';

@Injectable()
export class GetCompanyByIdService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository
    ) {}

    async execute(id: number): Promise<CompanyEntityInterface> {
        const company = await this.companyRepository.getById(id);
        return company;
    }
}