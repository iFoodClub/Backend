import { Body, Controller, Get, Param, Post, Res, Put, Delete } from "@nestjs/common";
import { Response } from "express";
import { DishRatingEntityInterface } from "src/domain/repositories/dish-rating.repository.interface";
import { GetListByDishService } from "../../../application/use-cases/list-bydish.use-cases";
import { CreateDishRatingService } from "../../../application/use-cases/create-dish-rating.use-cases";
import { GetByDishAndUserService } from "../../../application/use-cases/get-bydish-and-user.use-cases";
import { UpdateDishRatingService } from "../../../application/use-cases/update-dish-rating.use-cases";
import { DeleteDishRatingService } from "../../../application/use-cases/delete-dish-rating.use-cases";
import { ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ListDishAverageRatingDtoResponse } from 'src/interfaces/http/dtos/response/listDishAverageRating.dto';
import { DishRatingSummaryDtoResponse } from 'src/interfaces/http/dtos/response/dishRatingSummary.dto';
import { CreateDishRatingDto } from 'src/interfaces/http/dtos/request/createDishRating.dto';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';

@ApiTags('Dish Rating API')
@Controller('dish-rating')
export class DishRatingControlller {
    constructor(
        private readonly getListByDish: GetListByDishService,
        private readonly createDishRatingService: CreateDishRatingService,
        private readonly getByDishAndUserService: GetByDishAndUserService,
        private readonly updateDishRatingService: UpdateDishRatingService,
        private readonly deleteDishRatingService: DeleteDishRatingService
    ) {}

    @Get('dish/:dishId')
    @ApiResponse({
        status: 200,
        description: 'Consulta realizada com sucesso',
        type: DishRatingSummaryDtoResponse,
    })
    @ApiResponse({
        status: 500,
        description: 'Erro interno do servidor',
    })
    async listByDish(@Param('dishId') dishId: string, @Res() res: Response): Promise<DishRatingEntityInterface>{
        const dishRating = await this.getListByDish.execute(Number(dishId));
        if (!dishRating) {
            res.status(404).json({
                success: false,
                message: 'Avaliação do prato não encontrada',
            });
            return;
        }
        res.status(200).json(dishRating);
    }

    @Get('user/:userId')
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
    })
    @ApiResponse({
        status: 200,
        description: 'Consulta realizada com sucesso',
        type: ListDishAverageRatingDtoResponse,
    })
    @ApiResponse({
        status: 404,
        description: 'Avaliação do usuário do prato não encontrada',
        type: Http404,
    })
    async getRatingByDishAndUser(
        @Param('userId') userId: string,
        @Res() res: Response){
            const dishRating = await this.getByDishAndUserService.execute(Number(userId));
        if (!dishRating) {
            res.status(404).json({
                success: false,
                message: 'Avaliação do usuário do prato não encontrada',
            });
            return;
        }
        res.status(200).json(dishRating);

    }

    @Post()
    @ApiBody({
        description: 'Dados da avaliação a serem criados',
        type: CreateDishRatingDto,
    })
    @ApiResponse({
        status: 201,
        description: 'Avaliação criada com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao criar avaliação',
        type: Http400,
    })
    creat(@Body() dishRating: DishRatingEntityInterface, @Res() res: Response){
        const { dishId, userId, rating } = dishRating;
        if(!(dishId && userId && rating)){
      res.status(400).json({
        sucess: false,
        message: 'Todos os campos são obrigatórios'
      });
      return;
    }
    this.createDishRatingService.execute(dishRating);
    res.send();
    }
    
    @Put(":id")
    @ApiParam({
        name: 'id',
        description: 'ID da avaliação',
    })
    @ApiBody({
        description: 'Dados para atualizar a avaliação',
        type: CreateDishRatingDto,
    })
    @ApiResponse({
        status: 200,
        description: 'Avaliação atualizada com sucesso',
        type: ListDishAverageRatingDtoResponse,
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao atualizar avaliação',
        type: Http400,
    })
    async update(
        @Param("id") id: string,
        @Body() ratingData: Partial<DishRatingEntityInterface>,
        @Res() res: Response
    ) {
        const expectedFields = ['userId', 'dishId', 'rating', 'description'];
        const receivedFields = Object.keys(ratingData);
        const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
        const dish = await this.updateDishRatingService.execute(Number(id), ratingData);

        if (invalidFields.length > 0) {
        res.status(400).json({
            success: false,
            message: `Campos inválidos: ${invalidFields.join(', ')}`,
        });
        return;
        }
        if (!dish) {
        res.status(404).json({
            success: false,
            message: 'Avaliação não encontrada',
        });
        return;
        }
        res.status(200).json(dish);
    }

    @Delete(":id")
    @ApiParam({
        name: 'id',
        description: 'ID da avaliação',
    })
    @ApiResponse({
        status: 204,
        description: 'Avaliação deletada com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao deletar avaliação',
        type: Http400,
    })
    async delete(@Param("id") id: string, @Res() res: Response) {
        try {
            await this.deleteDishRatingService.execute(Number(id));
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}