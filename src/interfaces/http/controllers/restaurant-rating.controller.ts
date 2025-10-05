import { Body, Controller, Get, Param, Post, Res, Put, Delete } from "@nestjs/common";
import { Response } from "express";
import { RestaurantRatingEntityInterface } from "src/domain/repositories/restaurant-rating.repository.interface";
import { GetListByRestaurantService } from "../../../application/use-cases/list-byrestaurant.use-cases";
import { CreateRestaurantRatingService } from "../../../application/use-cases/create-restaurant-rating.use-cases";
import { GetByRestaurantAndUserService } from "../../../application/use-cases/get-byrestaurant-and-user.use-cases";
import { UpdateRestaurantRatingService } from "../../../application/use-cases/update-restaurant-rating.use-cases";
import { DeleteRestaurantRatingService } from "../../../application/use-cases/delete-restaurant-rating.use-cases";
import { ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ListRestaurantAverageRatingDtoResponse } from "../dtos/response/listRestaurantAverageRating.dto";
import { ListRestaurantAverageRatingByUserDtoResponse } from "../dtos/response/listRestaurantAverageRatingByUser.dto";
import { CreateRestaurantRatingDto } from "../dtos/request/createRestaurantRating.dto";

@ApiTags('Restaurant Rating API')
@Controller('restaurant-rating')
export class RestaurantRatingController {
    constructor(
        private readonly getListByRestaurant: GetListByRestaurantService,
        private readonly createRestaurantRatingService: CreateRestaurantRatingService,
        private readonly getByRestaurantAndUserService: GetByRestaurantAndUserService,
        private readonly updateRestaurantRatingService: UpdateRestaurantRatingService,
        private readonly deleteRestaurantRatingService: DeleteRestaurantRatingService
    ) {}

    @Get(':restaurantId')
    @ApiParam({
        name: 'restaurantId',
        description: 'ID do restaurante',

    })
    @ApiResponse({
        status: 200,
        description: 'Consulta realizada com sucesso',
        isArray: true,
        type: ListRestaurantAverageRatingDtoResponse,
    })
    @ApiResponse({
        status: 500,
        description: 'Erro interno do servidor',
    })
    async listByRestaurant(@Param('restaurantId') restaurantId: string, @Res() res: Response): Promise<RestaurantRatingEntityInterface[]> {
        const restaurantRating = await this.getListByRestaurant.execute(Number(restaurantId));
        if (!restaurantRating) {
            res.status(404).json({
                success: false,
                message: 'Avaliação do restaurante não encontrada',
            });
            return;
        }
        res.status(200).json(restaurantRating);
    }

    @Get('/user/:userId')
    @ApiParam({
        name: 'userId',
        description: 'ID do usuário',
    })
    @ApiResponse({
        status: 200,
        description: 'Consulta realizada com sucesso',
        isArray: true,
        type: ListRestaurantAverageRatingByUserDtoResponse,
    })
    @ApiResponse({
        status: 404,
        description: 'Avaliação do usuário do restaurante não encontrada',
    })
    async getRatingByRestaurantAndUser(
        @Param('userId') userId: string,
        @Res() res: Response){
            const restaurantRating = await this.getByRestaurantAndUserService.execute(Number(userId));
        if (!restaurantRating) {
            res.status(404).json({
                success: false,
                message: 'Avaliação do usuário do restaurante não encontrada',
            });
            return;
        }
        res.status(200).json(restaurantRating);
    }

    @Post()
    @ApiBody({
        description: 'Dados da avaliação a serem criados',
        type: CreateRestaurantRatingDto,
    })
    @ApiResponse({
        status: 201,
        description: 'Avaliação criada com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao criar avaliação',
    })
    async create(@Body() restaurantRating: RestaurantRatingEntityInterface, @Res() res: Response){
        const { restaurantId, userId, rating, description } = restaurantRating;
        if(!(restaurantId && userId && rating && description)){
            res.status(400).json({
                sucess: false,
                message: 'Todos os campos são obrigatórios'
            });
            return;
        }
        await this.createRestaurantRatingService.execute(restaurantRating);
        res.status(201).send();
    }
    
    @Put(":id")
    @ApiParam({
        name: 'id',
        description: 'ID da avaliação',
    })
    @ApiBody({
        description: 'Dados para atualizar a avaliação',
        type: CreateRestaurantRatingDto,
    })
    @ApiResponse({
        status: 200,
        description: 'Avaliação atualizada com sucesso',
    })
    @ApiResponse({
        status: 400,
        description: 'Erro ao atualizar avaliação',
    })
    async update(
        @Param("id") id: string,
        @Body() ratingData: Partial<RestaurantRatingEntityInterface>,
        @Res() res: Response
    ) {
        const expectedFields = ['restaurantId', 'userId', 'rating', 'description'];
        const receivedFields = Object.keys(ratingData);
        const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
        if (invalidFields.length > 0) {
            res.status(400).json({ success: false, message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}` });
            return;
        }
        const updated = await this.updateRestaurantRatingService.execute(Number(id), ratingData);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Avaliação não encontrada' });
            return;
        }
        res.status(200).json(updated);
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
    })
    async delete(@Param("id") id: string, @Res() res: Response) {
        try {
            await this.deleteRestaurantRatingService.execute(Number(id));
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
} 