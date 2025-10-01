import { Inject, Injectable } from "@nestjs/common";
import { CompanyEntityInterface } from "../../domain/repositories/company.repository.interface";
import { CompanyRepository } from '../../infrastructure/database/repositories/company.repository';

@Injectable()
export class ListCompaniesService {
    constructor(
        @Inject('COMPANY_REPOSITORY')
        private readonly companyRepository: CompanyRepository
    ) {}

    async execute(): Promise<CompanyEntityInterface[]> {
        return await this.companyRepository.list();
    }
}