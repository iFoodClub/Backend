import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Res, NotFoundException } from '@nestjs/common';

import { GetRestaurantByIdService } from '../../../application/use-cases/get-restaurant-byid.use-cases'
import { CreateRestaurantService } from '../../../application/use-cases/create-restaurant.use-cases';
import { UpdateRestaurantService } from '../../../application/use-cases/update-restaurant.use-cases';
import { DeleteRestaurantService } from '../../../application/use-cases/delete-restaurant.use-cases';
import { Response } from 'express';
import { RestaurantInterface } from 'src/domain/models/restaurant.model';
import { ApiBody, ApiExtraModels, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListRestaurantDtoResponse } from 'src/interfaces/http/dtos/response/listRestaurant.dto';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';
import { CreateRestaurantDto } from 'src/interfaces/http/dtos/request/createRestaurant.dto';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { ListRestaurantService } from '../../../application/use-cases/list-restaurant.use-cases';
import { RestaurantDetailDtoResponse, RestaurantDetailDishDto, RestaurantDetailRatingDto } from 'src/interfaces/http/dtos/response/restaurant-detail.dto';
import { ListOrdersByRestaurantUseCase } from 'src/application/use-cases/list-orders-by-restaurant.use-case';
import { ICompanyOrder } from 'src/domain/models/company-order.model';
import { SendOrdersUseCase } from 'src/application/use-cases/send-orders.use-case';
import { SendOrdersDto } from 'src/interfaces/http/dtos/request/send-orders.dto';
import { CreateIndividualOrderUseCase } from 'src/application/use-cases/create-indivisual-order.use-case';
import { CreateCompanyOrderDto, CreateIndividualOrderDto } from 'src/interfaces/http/dtos/request/create-company-order.dto';
import { UpdateIndividualOrderStatusUseCase } from 'src/application/use-cases/update-individual-order-status.use-case';
import { UpdateCompanyOrderStatusUseCase } from 'src/application/use-cases/update-company-order-status.use-case';
import { GetOrderProgressUseCase } from 'src/application/use-cases/get-order-progress.use-case';
import { UpdateIndividualOrderStatusDto } from 'src/interfaces/http/dtos/request/update-individual-order-status.dto';
import { UpdateCompanyOrderStatusDto } from 'src/interfaces/http/dtos/request/update-company-order-status.dto';
import { OrderProgressDto } from 'src/interfaces/http/dtos/response/order-progress.dto';

@ApiTags('Restaurant API')
@ApiExtraModels(RestaurantDetailDtoResponse, RestaurantDetailDishDto, RestaurantDetailRatingDto, OrderProgressDto)
@Controller('Restaurant')
export class RestaurantController {
  constructor(
    private listRestaurantService: ListRestaurantService,
    private getRestaurantByIdService: GetRestaurantByIdService,
    private createRestaurantService: CreateRestaurantService,
    private updateRestaurantService: UpdateRestaurantService,
    private deleteRestaurantService: DeleteRestaurantService,
    private listOrdersByRestaurantUseCase: ListOrdersByRestaurantUseCase,
    private sendOrdersUseCase: SendOrdersUseCase,
    private createCompanyOrderUseCase: CreateIndividualOrderUseCase,
    private updateIndividualOrderStatusUseCase: UpdateIndividualOrderStatusUseCase,
    private updateCompanyOrderStatusUseCase: UpdateCompanyOrderStatusUseCase,
    private getOrderProgressUseCase: GetOrderProgressUseCase,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    isArray: true,
    type: ListRestaurantDtoResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async list(): Promise<RestaurantInterface[]> {
    const restaurantList = await this.listRestaurantService.execute();
    return restaurantList;
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta realizada com sucesso',
    type: RestaurantDetailDtoResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante não encontrado',
    type: Http404,
  })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<RestaurantInterface> {
    const product = await this.getRestaurantByIdService.execute(Number(id));
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
      });
      return;
    }

    res.status(200).json(product);
  }

  @Post()
  @HttpCode(201)
  @ApiBody({
    type: CreateRestaurantDto,
    description: 'Dados do restaurante',
  })
  @ApiResponse({
    status: 201,
    description: 'Restaurante criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar restaurante',
    type: Http400,
  })
  create(
    @Body() restaurant: RestaurantInterface, @Res() res: Response) {
    const { userId, name, cnpj, cep, number} = restaurant;
    if(!(userId && name && cnpj && cep && number)) {
      res.status(400).json({
        sucess: false,
        message: 'Todos os campos são obrigatórios'
      });
      return;
    }
    this.createRestaurantService.execute(restaurant);
    res.send();
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiBody({
    description: 'Dados do restaurante a serem atualizados',
    type: CreateRestaurantDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurante atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar restaurante',
    type: Http400,
  })
  async update(@Param('id') id: string, @Body() restaurantData: RestaurantInterface,@Res() res: Response): Promise<RestaurantInterface> {
    const expectedFields = ['userId', 'name', 'cnpj', 'cep', 'number', 'profileImage'];
    const receivedFields = Object.keys(restaurantData);
    const invalidFields = receivedFields.filter(field => !expectedFields.includes(field));
    const restaurant = await this.updateRestaurantService.execute(Number(id), restaurantData);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado',
      });
      return;
    }
    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Os seguintes campos são inválidos: ${invalidFields.join(', ')}`,
      });
      return;
    }
    res.status(200).json(restaurant);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const restaurant = await this.getRestaurantByIdService.execute(Number(id));
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Restaurante deletado com sucesso',
    });
    
    this.deleteRestaurantService.execute(Number(id));
  }

  @Get(':id/orders')
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta de pedidos realizada com sucesso',
    // Idealmente, criaríamos um DTO de resposta aqui, mas por simplicidade vamos usar o modelo.
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado para este restaurante',
    type: Http404,
  })
  async listOrders(@Param('id') id: string): Promise<ICompanyOrder[]> {
    return this.listOrdersByRestaurantUseCase.execute(Number(id));
  }

  // @Post(':id/orders/send')
  // @HttpCode(200)
  // @ApiParam({
  //   name: 'id',
  //   description: 'ID do restaurante',
  // })
  // @ApiBody({
  //   type: SendOrdersDto,
  //   description: 'IDs dos pedidos a serem enviados',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Pedidos enviados com sucesso',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Pedido não encontrado',
  //   type: Http404,
  // })
  // async sendOrders(
  //   @Param('id') restaurantId: string,
  //   @Body() sendOrdersDto: SendOrdersDto,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   try {
  //     await this.sendOrdersUseCase.execute(sendOrdersDto.orderIds);
  //     res.status(200).json({
  //       success: true,
  //       message: 'Pedidos enviados com sucesso',
  //     });
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       res.status(404).json({
  //         success: false,
  //         message: error.message,
  //       });
  //     } else {
  //       res.status(500).json({
  //         success: false,
  //         message: 'Erro interno do servidor',
  //       });
  //     }
  //   }
  // }

  @Post(':id/orders')
  @HttpCode(201)
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiBody({
    type: CreateIndividualOrderDto,
    description: 'Dados do pedido a ser criado',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar pedido',
    type: Http400,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa, restaurante, funcionário ou prato não encontrado',
    type: Http404,
  })
  async createOrder(
    @Param('id') restaurantId: string,
    @Body() createOrderDto: CreateIndividualOrderDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validar se o restaurante da URL corresponde ao do DTO
      if (Number(restaurantId) !== createOrderDto.restaurantId) {
        res.status(400).json({
          success: false,
          message: 'ID do restaurante na URL não corresponde ao ID no corpo da requisição',
        });
        return;
      }

      const result = await this.createCompanyOrderUseCase.execute(createOrderDto);
      res.status(201).json({
        success: true,
        message: result.message,
        // orderId: result.id,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  @Put(':restaurantId/orders/:orderId/individual-orders/:individualOrderId/status')
  @HttpCode(200)
  @ApiParam({
    name: 'restaurantId',
    description: 'ID do restaurante',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID do pedido da empresa',
  })
  @ApiParam({
    name: 'individualOrderId',
    description: 'ID do pedido individual',
  })
  @ApiBody({
    type: UpdateIndividualOrderStatusDto,
    description: 'Dados para atualização do status do pedido individual',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do pedido individual atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar status',
    type: Http400,
  })
  async updateIndividualOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Param('individualOrderId') individualOrderId: string,
    @Body() updateDto: UpdateIndividualOrderStatusDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validar se o ID do pedido individual na URL corresponde ao do DTO
      if (Number(individualOrderId) !== updateDto.id) {
        res.status(400).json({
          success: false,
          message: 'ID do pedido individual na URL não corresponde ao ID no corpo da requisição',
        });
        return;
      }

      const result = await this.updateIndividualOrderStatusUseCase.execute(
        Number(individualOrderId),
        updateDto.status
      );

      res.status(200).json({
        success: true,
        message: result.message,
        companyOrderUpdated: result.companyOrderUpdated || false,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  @Put(':restaurantId/orders/:orderId/status')
  @HttpCode(200)
  @ApiParam({
    name: 'restaurantId',
    description: 'ID do restaurante',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID do pedido da empresa',
  })
  @ApiBody({
    type: UpdateCompanyOrderStatusDto,
    description: 'Dados para atualização do status do pedido da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do pedido da empresa atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar status',
    type: Http400,
  })
  async updateCompanyOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateCompanyOrderStatusDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validar se o ID do pedido da empresa na URL corresponde ao do DTO
      if (Number(orderId) !== updateDto.id) {
        res.status(400).json({
          success: false,
          message: 'ID do pedido da empresa na URL não corresponde ao ID no corpo da requisição',
        });
        return;
      }

      const result = await this.updateCompanyOrderStatusUseCase.execute(
        Number(orderId),
        updateDto.status
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  @Get('orders/:orderId/progress')
  @ApiParam({
    name: 'orderId',
    description: 'ID do pedido da empresa',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações de progresso obtidas com sucesso',
    type: OrderProgressDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado',
    type: Http404,
  })
  async getOrderProgress(
    // @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const progress = await this.getOrderProgressUseCase.execute(Number(orderId));

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }
}