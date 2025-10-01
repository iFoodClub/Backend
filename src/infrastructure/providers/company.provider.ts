import { CompanyEntity } from "../database/entities/company.entity";
import { CompanyRepository } from '../database/repositories/company.repository';

export const companyProvider = [
  {
    provide: 'COMPANY_ENTITY',
    useValue: CompanyEntity,
  },
  {
    provide: 'COMPANY_REPOSITORY',
    useClass: CompanyRepository,
  },
];