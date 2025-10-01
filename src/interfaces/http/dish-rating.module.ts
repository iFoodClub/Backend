import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/infrastructure/database/database.module";
import { dishRatingProvider } from "src/infrastructure/providers/dish-rating.provider";
import { DishRatingControlller } from "./controllers/dish-rating.controller";
import { CreateDishRatingService } from "src/application/use-cases/create-dish-rating.use-cases";
import { DeleteDishRatingService } from "src/application/use-cases/delete-dish-rating.use-cases";
import { GetByDishAndUserService } from "src/application/use-cases/get-bydish-and-user.use-cases";
import { GetListByDishService } from "src/application/use-cases/list-bydish.use-cases";
import { UpdateDishRatingService } from "src/application/use-cases/update-dish-rating.use-cases";

@Module({
    imports: [DatabaseModule],
    controllers: [DishRatingControlller],
    providers: [
        ...dishRatingProvider,
        UpdateDishRatingService, 
        DeleteDishRatingService,
        GetListByDishService,
        CreateDishRatingService,
        GetByDishAndUserService,
    ],
    exports: [
        UpdateDishRatingService, 
        DeleteDishRatingService,
        GetListByDishService,
        CreateDishRatingService,
        GetByDishAndUserService,],
})

export class DishRatingModule {}