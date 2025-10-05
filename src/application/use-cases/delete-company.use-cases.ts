import { Inject, Injectable } from "@nestjs/common";
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';

@Injectable()
export class DeleteCompanyService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository
    ) {}

    async execute(id: number): Promise<void> {
        await this.companyRepository.delete(id);
    }
}