import { Module } from '@nestjs/common';
import { DishModule } from './interfaces/http/dish.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DishController } from './interfaces/http/controllers/dish.controller';
import { CompanyModule } from './interfaces/http/company.module';
import { EmployeeModule } from './interfaces/http/employee.module';
import { RestaurantModule } from './interfaces/http/restaurant.module';
import { EmployeeController } from './interfaces/http/controllers/employee.controller';
import { RestaurantController } from './interfaces/http/controllers/restaurant.controller';
import { CompanyController } from './interfaces/http/controllers/company.controller';
import { UserController } from './interfaces/http/controllers/user.controller';
import { UserModule } from './interfaces/http/user.module';
import { DishRatingControlller } from './interfaces/http/controllers/dish-rating.controller';
import { DishRatingModule } from './interfaces/http/dish-rating.module';
import { AuthModule } from './interfaces/http/auth.module';
import { EmployeeWeeklyOrdersController } from './interfaces/http/controllers/employee-weekly-orders.controller';
import { RestaurantRatingModule } from './interfaces/http/restaurant-rating.module';
import { RestaurantRatingController } from './interfaces/http/controllers/restaurant-rating.controller';
import { EmployeeWeeklyOrdersModule } from './interfaces/http/employee-weekly-orders.module';
import { HealthCheckModule} from './interfaces/http/health-check.module';

@Module({
  imports: [CompanyModule, DishModule, DatabaseModule, EmployeeModule, DishRatingModule,
            RestaurantModule, UserModule, AuthModule, EmployeeWeeklyOrdersModule,
            RestaurantRatingModule, HealthCheckModule],
  controllers: [CompanyController, DishController, EmployeeController, DishRatingControlller,
                RestaurantController,UserController, EmployeeWeeklyOrdersController,
                RestaurantRatingController],
  providers: [],
})
export class AppModule {}