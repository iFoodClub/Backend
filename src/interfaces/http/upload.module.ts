import { Module } from '@nestjs/common';
import { S3UploadService } from '../../infrastructure/services/s3-upload.service';
import { s3UploadProvider } from '../../infrastructure/providers/s3-upload.provider';
import { UploadController } from './controllers/upload.controller';
import { UploadOwnershipGuard } from 'src/infrastructure/guards/upload-ownership.guard';
import { CompanyRepository } from 'src/infrastructure/database/repositories/company.repository';
import { RestaurantRepository } from 'src/infrastructure/database/repositories/restaurant.repository';
import { EmployeeRepository } from 'src/infrastructure/database/repositories/employee.repository';
import { DishRepository } from 'src/infrastructure/database/repositories/dish.repository';
import { companyProvider } from 'src/infrastructure/providers/company.provider';
import { restaurantProvider } from 'src/infrastructure/providers/restaurant.provider';
import { dishProvider } from 'src/infrastructure/providers/dish.provider';
import { employeeProvider } from 'src/infrastructure/providers/employee.provider';

@Module({
  controllers: [UploadController],
  providers: [
    ...s3UploadProvider,
    ...companyProvider,
    ...restaurantProvider,
    ...employeeProvider,
    ...dishProvider,
    S3UploadService,
    UploadOwnershipGuard,
    CompanyRepository,
    RestaurantRepository,
    EmployeeRepository,
    DishRepository,
  ],
  exports: [S3UploadService],
})
export class UploadModule {}
