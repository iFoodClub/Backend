import { Inject, Injectable } from '@nestjs/common';
import { CompanyEntity } from '../entities/company.entity';
import { CompanyEntityInterface } from '../../../domain/repositories/company.repository.interface';

@Injectable()
export class CompanyRepository {
  constructor(
    @Inject('COMPANY_ENTITY')
    private readonly companyEntity: typeof CompanyEntity,
  ) {}

  async create(company: Omit<CompanyEntityInterface, 'id'>): Promise<CompanyEntityInterface> {
    return await this.companyEntity.create(company);
  }

  async update(
    id: number,
    companyData: Partial<Omit<CompanyEntityInterface, 'id'>>,
  ): Promise<CompanyEntityInterface> {
    const company = await this.companyEntity.findByPk(id);
    return await company.update(companyData);
  }

  async getById(id: number): Promise<CompanyEntityInterface | null> {
    return await this.companyEntity.findByPk(id);
  }

  async list(): Promise<CompanyEntityInterface[]> {
    return await this.companyEntity.findAll();
  }

  async delete(id: number): Promise<void> {
    const company = await this.companyEntity.findByPk(id);
    await company.destroy();
  }

  async findByCnpj(cnpj: string): Promise<CompanyEntityInterface | null> {
    return await this.companyEntity.findOne({ where: { cnpj } });
  }

  async findByUserId(userId: number): Promise<CompanyEntityInterface | null> {
    return await this.companyEntity.findOne({ where: { userId } });
  }
}