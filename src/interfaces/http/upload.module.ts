import { Module } from '@nestjs/common';
import { AzureBlobUploadService } from '../../infrastructure/services/blob-upload.service';
import { UploadController } from './controllers/upload.controller';
import { UploadOwnershipGuard } from 'src/infrastructure/guards/upload-ownership.guard';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { companyProvider } from 'src/infrastructure/providers/company.provider';
import { restaurantProvider } from 'src/infrastructure/providers/restaurant.provider';
import { dishProvider } from 'src/infrastructure/providers/dish.provider';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';
import { userProvider } from 'src/infrastructure/providers/user.provider';

@Module({
  controllers: [UploadController],
  providers: [
    ...companyProvider,
    ...restaurantProvider,
    ...employeeProvider,
    ...dishProvider,
    ...userProvider,
    AzureBlobUploadService,
    UploadOwnershipGuard,
    CompanyRepository,
    RestaurantRepository,
    EmployeeRepository,
    DishRepository,
    UserRepository,
  ],
  exports: [AzureBlobUploadService],
})
export class UploadModule { }
