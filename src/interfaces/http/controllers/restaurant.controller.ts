import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Res,
  NotFoundException,
  BadRequestException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { GetRestaurantByIdService } from '../../../application/use-cases/get-restaurant-byid.use-cases';
import { CreateRestaurantService } from '../../../application/use-cases/create-restaurant.use-cases';
import { UpdateRestaurantService } from '../../../application/use-cases/update-restaurant.use-cases';
import { DeleteRestaurantService } from '../../../application/use-cases/delete-restaurant.use-cases';
import { Response } from 'express';
import { RestaurantInterface } from 'src/domain/models/restaurant.model';
import {
  ApiBody,
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { ListRestaurantDtoResponse } from 'src/interfaces/http/dtos/response/listRestaurant.dto';
import { Http404 } from 'src/interfaces/http/dtos/response/http404';
import { CreateRestaurantDto } from 'src/interfaces/http/dtos/request/createRestaurant.dto';
import { Http400 } from 'src/interfaces/http/dtos/response/http400';
import { ListRestaurantService } from '../../../application/use-cases/list-restaurant.use-cases';
import {
  RestaurantDetailDtoResponse,
  RestaurantDetailDishDto,
  RestaurantDetailRatingDto,
} from 'src/interfaces/http/dtos/response/restaurant-detail.dto';
import { ListOrdersByRestaurantUseCase } from 'src/application/use-cases/list-orders-by-restaurant.use-case';
import { ICompanyOrder } from 'src/domain/models/company-order.model';
import { SendOrdersUseCase } from 'src/application/use-cases/send-orders.use-case';
import { CreateIndividualOrderUseCase } from 'src/application/use-cases/create-indivisual-order.use-case';
import { CreateIndividualOrderDto } from 'src/interfaces/http/dtos/request/create-company-order.dto';
import { UpdateIndividualOrderStatusUseCase } from 'src/application/use-cases/update-individual-order-status.use-case';
import { UpdateCompanyOrderStatusUseCase } from 'src/application/use-cases/update-company-order-status.use-case';
import { GetOrderProgressUseCase } from 'src/application/use-cases/get-order-progress.use-case';
import { UpdateIndividualOrderStatusDto } from 'src/interfaces/http/dtos/request/update-individual-order-status.dto';
import { UpdateCompanyOrderStatusDto } from 'src/interfaces/http/dtos/request/update-company-order-status.dto';
import { OrderProgressDto } from 'src/interfaces/http/dtos/response/order-progress.dto';
import { SqlInjectionGuard } from '../../../infrastructure/security/sql-injection.guard';
import { InputValidationPipe } from '../../../infrastructure/security/input-validation.pipe';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { UploadAuthorizationGuard } from 'src/infrastructure/guards/upload-authorization.guard';
import { UploadOwnershipGuard } from 'src/infrastructure/guards/upload-ownership.guard';
import { UpdateRestaurantProfileUseCase } from 'src/application/use-cases/update-restaurant-profile.use-case';
import { RequestRestaurantEmailChangeUseCase } from 'src/application/use-cases/request-restaurant-email-change.use-case';
import { ConfirmRestaurantEmailChangeUseCase } from 'src/application/use-cases/confirm-restaurant-email-change.use-case';
import { UpdateRestaurantProfileDto } from 'src/interfaces/http/dtos/request/updateRestaurantProfile.dto';
import { RequestEmailChangeDto } from 'src/interfaces/http/dtos/request/requestEmailChange.dto';
import { RestaurantProfileResponseDto } from 'src/interfaces/http/dtos/response/restaurantProfile.dto';
import { ListFavoritesUseCase } from 'src/application/use-cases/list-favorites.use-case';
import { ToggleFavoriteUseCase } from 'src/application/use-cases/toggle-favorite.use-case';
import { UserType } from 'src/domain/models/user.model';

@ApiTags('Restaurant API')
@ApiExtraModels(
  RestaurantDetailDtoResponse,
  RestaurantDetailDishDto,
  RestaurantDetailRatingDto,
  OrderProgressDto,
)
@Controller('Restaurant')
@UseGuards(SqlInjectionGuard)
@UsePipes(InputValidationPipe)
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
    private readonly updateRestaurantProfileUseCase: UpdateRestaurantProfileUseCase,
    private readonly requestRestaurantEmailChangeUseCase: RequestRestaurantEmailChangeUseCase,
    private readonly confirmRestaurantEmailChangeUseCase: ConfirmRestaurantEmailChangeUseCase,
    private listFavoritesUseCase: ListFavoritesUseCase,
    private toggleFavoriteUseCase: ToggleFavoriteUseCase,
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
  async getById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<RestaurantInterface> {
    const product = await this.getRestaurantByIdService.execute(Number(id));
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado',
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
  async create(@Body() restaurant: RestaurantInterface, @Res() res: Response) {
    const { userId, name, cnpj, cep, number } = restaurant;
    if (!(userId && name && cnpj && cep && number)) {
      res.status(400).json({
        sucess: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos',
      });
      return;
    }

    // Set default hours if not provided
    restaurant.openingTime = restaurant.openingTime || '08:00';
    restaurant.closingTime = restaurant.closingTime || '18:00';

    await this.createRestaurantService.execute(restaurant);
    res.send();
  }

  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @ApiBearerAuth('JWT-auth')
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
  async update(
    @Param('id') id: string,
    @Body() restaurantData: RestaurantInterface,
    @Res() res: Response,
  ): Promise<RestaurantInterface> {
    const expectedFields = [
      'userId',
      'name',
      'cnpj',
      'cep',
      'rua',
      'number',
      'profileImage',
      'openingTime',
      'closingTime',
    ];
    const receivedFields = Object.keys(restaurantData);
    const invalidFields = receivedFields.filter(
      (field) => !expectedFields.includes(field),
    );
    const restaurant = await this.updateRestaurantService.execute(
      Number(id),
      restaurantData,
    );
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

  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @ApiBearerAuth('JWT-auth')
  @Put(':id/profile')
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiBody({
    type: UpdateRestaurantProfileDto,
    description:
      'Dados editáveis do perfil do restaurante (CNPJ e e-mail não são alterados aqui)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do restaurante atualizado com sucesso',
    type: RestaurantProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou tentativa de alterar campo proibido',
    type: Http400,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante não encontrado',
    type: Http404,
  })
  async updateProfile(
    @Param('id') id: string,
    @Body()
    body: UpdateRestaurantProfileDto & { cnpj?: unknown; email?: unknown },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.updateRestaurantProfileUseCase.execute(
        Number(id),
        body,
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof BadRequestException) {
        res.status(400).json({
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

  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard, UploadOwnershipGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/email-change')
  @HttpCode(202)
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiBody({
    type: RequestEmailChangeDto,
    description: 'Novo e-mail desejado para o restaurante',
  })
  @ApiResponse({
    status: 202,
    description:
      'Solicitação aceita: link de confirmação enviado ao novo e-mail',
  })
  @ApiResponse({
    status: 400,
    description: 'E-mail inválido, igual ao atual ou já em uso',
    type: Http400,
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante não encontrado',
    type: Http404,
  })
  async requestEmailChange(
    @Param('id') id: string,
    @Body() body: RequestEmailChangeDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result = await this.requestRestaurantEmailChangeUseCase.execute(
        Number(id),
        body.newEmail,
      );
      res.status(202).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof BadRequestException) {
        res.status(400).json({
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

  @Post('verify-email-change/:token')
  @HttpCode(200)
  @ApiParam({
    name: 'token',
    description: 'Token recebido por e-mail para confirmar a troca',
  })
  @ApiResponse({
    status: 200,
    description: 'E-mail confirmado e atualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado ou e-mail já em uso',
    type: Http400,
  })
  async verifyEmailChange(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result =
        await this.confirmRestaurantEmailChangeUseCase.execute(token);
      res.status(200).json({
        success: true,
        message: result.message,
        email: result.email,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        res.status(400).json({
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

  @UseGuards(
    JwtAuthGuard,
    UploadAuthorizationGuard,
    UploadOwnershipGuard,
    SqlInjectionGuard,
  )
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID do restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurante deletado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurante não encontrado',
    type: Http404,
  })
  async delete(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const restaurant = await this.getRestaurantByIdService.execute(Number(id));
    if (!restaurant) {
      res.status(404).json({
        success: false,
        message: 'Restaurante não encontrado',
      });
      return;
    }
    this.deleteRestaurantService.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Restaurante deletado com sucesso',
    });
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
          message:
            'ID do restaurante na URL não corresponde ao ID no corpo da requisição',
        });
        return;
      }

      const result =
        await this.createCompanyOrderUseCase.execute(createOrderDto);
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

  @Put(
    ':restaurantId/orders/:orderId/individual-orders/:individualOrderId/status',
  )
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
      const result = await this.updateIndividualOrderStatusUseCase.execute(
        Number(individualOrderId),
        updateDto.status,
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
      const result = await this.updateCompanyOrderStatusUseCase.execute(
        Number(orderId),
        updateDto.status,
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
      const progress = await this.getOrderProgressUseCase.execute(
        Number(orderId),
      );

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

  @ApiTags('Favorites')
  @Post('favorites/toggle')
  @ApiOperation({
    summary:
      'Adiciona ou remove um restaurante dos favoritos (apenas empresas)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 7 },
        restaurantId: { type: 'number', example: 2 },
        userType: {
          type: 'string',
          enum: ['company', 'employee', 'restaurant'],
          example: 'company',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status de favorito alternado com sucesso',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido: Apenas empresas podem favoritar',
  })
  async toggleFavorite(
    @Body() data: { userId: number; restaurantId: number; userType: UserType },
    @Res() res: Response,
  ) {
    try {
      const result = await this.toggleFavoriteUseCase.execute(
        data.userId,
        data.restaurantId,
        data.userType,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Erro interno ao alternar favorito' });
    }
  }

  @ApiTags('Favorites')
  @Get('favorites/:userId')
  @ApiOperation({
    summary: 'Lista todos os restaurantes favoritos de um usuário',
  })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos retornada com sucesso',
  })
  async listFavorites(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const favorites = await this.listFavoritesUseCase.execute(Number(userId));
      return res.status(200).json(favorites || []);
    } catch (error) {
      console.error('Erro ao listar favoritos:', error);
      return res.status(200).json([]);
    }
  }
}
