import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res } from '@nestjs/common';

import { GetDishByIdService } from '../../../application/use-cases/get-dish-byid.use-cases';
import { DishInterface } from 'src/domain/models/dish.model';
import { CreateDishService } from '../../../application/use-cases/create-dish.use-cases';
import { UpdateDishService } from '../../../application/use-cases/update-dish.use-cases';
import { DeleteDishService } from '../../../application/use-cases/delete-dish.use-cases';
import { Response } from 'express';
import { DishEntityInterface } from 'src/domain/repositories/dish.repository.interface';
import { ListDishesService } from '../../../application/use-cases/list-dishes.use-cases';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListDishDtoResponse } from 'src/interfaces/http/dtos/response/listDish.dto';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';
import { CreateDishDto } from 'src/interfaces/http/dtos/request/createDish.dto';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { ListDishesByRestaurantService } from '../../../application/use-cases/list-dishes-by-restaurant.use-cases';
import { AverageRatingByRestaurantService } from '../../../application/use-cases/average-rating-by-restaurant.use-cases';
import { AverageRatingDishInterface } from '../../../domain/models/average-rating-dish.model';
import { ListDishRatingDtoResponse } from 'src/interfaces/http/dtos/response/listDishRating.dto';
import { DishEmployeeEntityInterface } from 'src/domain/repositories/dish-employee.respository.interface';
import { ListDishAverageRatingDtoResponse } from 'src/interfaces/http/dtos/response/listDishAverageRating.dto';

@ApiTags('Dish API')
@Controller('Dish')
export class DishController {
  constructor(
    private listDishesService: ListDishesService,
    private getDishByIdService: GetDishByIdService,
    private createDishService: CreateDishService,
    private updateDishService: UpdateDishService,
    private deleteDishService: DeleteDishService,
    private listDishesByRestaurantService: ListDishesByRestaurantService,
    private averageRatingByRestaurantService: AverageRatingByRestaurantService
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    isArray: true,
    type: ListDishDtoResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async list(): Promise<DishEmployeeEntityInterface[]> {
    const dishList = await this.listDishesService.execute();

    return dishList;
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do prato',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    type: ListDishDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Prato não encontrado',
    type: Http404,
  })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<DishInterface> {
    const dish = await this.getDishByIdService.execute(Number(id));
    if (!dish) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    res.status(200).json(dish);
  }

  @Post()
  @HttpCode(201)
  @ApiBody({
    description: 'Dados do prato a serem criados',
    type: CreateDishDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Prato criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar prato',
    type: Http400,
  })
  create(
    @Body() dish: DishInterface, @Res() res: Response) {
    const { restaurantId, name, description, price, image } = dish;
    if(!(restaurantId && name && description && price && image)){
      res.status(400).json({
        sucess: false,
        message: 'Todos os campos são obrigatórios'
      });
      return;
    }
    this.createDishService.execute(dish);
    res.send();
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do prato',
  })
  @ApiBody({
    description: 'Dados do prato a serem atualizados',
    type: CreateDishDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Prato atualizado com sucesso',
    type: ListDishDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Prato não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar prato',
    type: Http400,
  })
  async update(@Param('id') id: string, @Body() dishData: DishInterface, @Res() res: Response): Promise<DishInterface> {
    const expectedFields = ['restaurantId', 'name', 'description', 'price', 'image'];
    const receivedFields = Object.keys(dishData);
    const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
    const dish = await this.updateDishService.execute(Number(id), dishData);

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
        message: 'Prato não encontrado',
      });
      return;
    }
    res.status(200).json(dish);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do prato a ser deletado',
  })
  @ApiResponse({
    status: 200,
    description: 'Prato deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Prato não encontrado',
    type: Http404,
  })
  async delete(@Param('id') id: string, @Res() res: Response): Promise<void> {
  const dish = await this.getDishByIdService.execute(Number(id));
  if (!dish) {
      res.status(404).json({
        success: false,
        message: 'Prato não encontrado',
      });
      return;
    }
    this.deleteDishService.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Prato deletado com sucesso',
    });
  }

  @Get('by-restaurant/:restaurantId')
  @ApiParam({
    name: 'restaurantId',
    description: 'ID do restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pratos do restaurante com suas avaliações',
    isArray: true,
    type: ListDishRatingDtoResponse,
  })
  async listByRestaurant(@Param('restaurantId') restaurantId: string, @Res() res: Response): Promise<void> {
    const dishes = await this.listDishesByRestaurantService.execute(Number(restaurantId));
    res.status(200).json(dishes);
  }

  @Get('by-restaurant/:restaurantId/average-rating')
  @ApiParam({
    name: 'restaurantId',
    description: 'ID do restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pratos do restaurante com média das avaliações',
    isArray: true,
    type: ListDishAverageRatingDtoResponse,
  })
  async averageRatingByRestaurant(@Param('restaurantId') restaurantId: string, @Res() res: Response): Promise<void> {
    const dishes: AverageRatingDishInterface[] = await this.averageRatingByRestaurantService.execute(Number(restaurantId));
    res.status(200).json(dishes);
  }
}