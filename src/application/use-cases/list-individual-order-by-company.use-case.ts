import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IndividualOrderRepository } from "src/infrastructure/database/repositories/individual-order.repository";
import { CompanyRepository } from "src/infrastructure/database/repositories/company.repository";
import { IndividualOrderEntityInterface } from "src/domain/repositories/individual-order.repository.interface";

@Injectable()
export class ListIndividualOrderByCompanyUseCase {
  constructor(
    @Inject('INDIVIDUAL_ORDER_REPOSITORY')
    private readonly individualOrderRepository: IndividualOrderRepository,
    @Inject('COMPANY_REPOSITORY')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(companyId: number): Promise<IndividualOrderEntityInterface[]> {
    const company = await this.companyRepository.getById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return await this.individualOrderRepository.listByCompanyOrderIdNull(companyId);
  }
}