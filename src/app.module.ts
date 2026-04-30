import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DishModule } from './interfaces/http/dish.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DatabaseModule as DatabaseControllerModule } from './interfaces/http/database.module';
import { DishController } from './interfaces/http/controllers/dish.controller';
import { CompanyModule } from './interfaces/http/company.module';
import { EmployeeModule } from './interfaces/http/employee.module';
import { RestaurantModule } from './interfaces/http/restaurant.module';
import { EmployeeController } from './interfaces/http/controllers/employee.controller';
import { RestaurantController } from './interfaces/http/controllers/restaurant.controller';
import { CompanyController } from './interfaces/http/controllers/company.controller';
import { UserModule } from './interfaces/http/user.module';
import { DishRatingControlller } from './interfaces/http/controllers/dish-rating.controller';
import { DishRatingModule } from './interfaces/http/dish-rating.module';
import { AuthModule } from './interfaces/http/auth.module';
import { EmployeeWeeklyOrdersController } from './interfaces/http/controllers/employee-weekly-orders.controller';
import { RestaurantRatingModule } from './interfaces/http/restaurant-rating.module';
import { RestaurantRatingController } from './interfaces/http/controllers/restaurant-rating.controller';
import { EmployeeWeeklyOrdersModule } from './interfaces/http/employee-weekly-orders.module';
import { HealthCheckModule } from './interfaces/http/health-check.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { UploadModule } from './interfaces/http/upload.module';
import { ObservabilityModule } from './interfaces/http/observability.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from './infrastructure/observability/metrics.interceptor';
// import { AuditLogModule } from './interfaces/http/audit-log.module'; // Desabilitado temporariamente - Mongoose/MongoDB

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    // AuditLogModule, // Desabilitado temporariamente - Mongoose/MongoDB
    CompanyModule,
    DishModule,
    DatabaseModule,
    DatabaseControllerModule,
    EmployeeModule,
    DishRatingModule,
    RestaurantModule,
    UserModule,
    AuthModule,
    EmployeeWeeklyOrdersModule,
    RestaurantRatingModule,
    HealthCheckModule,
    SecurityModule,
    UploadModule,
  ],
  controllers: [
    CompanyController,
    DishController,
    EmployeeController,
    DishRatingControlller,
    RestaurantController,
    EmployeeWeeklyOrdersController,
    RestaurantRatingController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
