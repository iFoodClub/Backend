import { Sequelize } from 'sequelize-typescript';
import { DishEntity } from '../database/entities/dish.entity';
import { CompanyEntity } from '../database/entities/company.entity';
import { EmployeeEntity } from '../database/entities/employee.entity';
import { RestaurantEntity } from '../database/entities/restaurant.entity';
import { UserEntity } from '../database/entities/user.entity';
import { DishRatingEntity } from '../database/entities/dish-rating.entity';
import { OrderItemEntity } from '../database/entities/order-item.entity';
import { CompanyAffiliateRestaurantEntity } from '../database/entities/company-affiliate-restaurant.entity';
import { IndividualOrderEntity } from '../database/entities/individual-order.entity';
import { EmployeeWeeklyOrdersEntity } from '../database/entities/employee-weekly-orders.entity';
import { CompanyOrderEntity } from '../database/entities/company-order.entity';
import { RestaurantRatingEntity } from '../database/entities/restaurant-rating.entity';
import { FavoriteRestaurantEntity } from '../database/entities/favorite-restaurant.entity';
import { SequelizeSecurityConfig } from '../security/sequelize-security.config';

export const databaseProvider = [
  {
    provide: 'SEQUELIZE',
    useFactory: () => {
      const useSsl = process.env.DB_SSL !== 'false';
      let sequelize: Sequelize;
      const dialectOptions = useSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {};

      if (process.env.DATABASE_URL) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
          dialect: 'postgres',
          dialectOptions,
          logging: false,
        });
      } else {
        sequelize = new Sequelize({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          dialect: 'postgres',
          dialectOptions,
          logging: false,
        });
      }

      sequelize.addModels([
        DishEntity,
        CompanyEntity,
        EmployeeEntity,
        RestaurantEntity,
        UserEntity,
        DishRatingEntity,
        OrderItemEntity,
        CompanyAffiliateRestaurantEntity,
        IndividualOrderEntity,
        EmployeeWeeklyOrdersEntity,
        CompanyOrderEntity,
        RestaurantRatingEntity,
        FavoriteRestaurantEntity,
      ]);

      // Aplica configurações de segurança
      SequelizeSecurityConfig.applySecurityConfig(sequelize);

      return sequelize;
    },
  },
];
