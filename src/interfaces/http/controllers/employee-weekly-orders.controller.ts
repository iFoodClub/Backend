/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Http400 } from '../dtos/response/http400';
import { Http404 } from '../dtos/response/http404';
import { CreateEmployeeWeeklyOrderDto } from 'src/interfaces/http/dtos/request/createEmployeeWeeklyOrder.dto';
import { EmployeeWeeklyOrderResponse } from 'src/interfaces/http/dtos/response/employeeWeeklyOrder.dto';
import { CreateOrUpdateWeeklyOrderService } from '../../../application/use-cases/create-or-update-weekly-order.use-cases';
import { GetWeeklyOrdersByEmployeeService } from '../../../application/use-cases/get-weekly-orders-by-employee.use-cases';
import { DeleteWeeklyOrderService } from '../../../application/use-cases/delete-weekly-order.use-cases';
import { ListAllWeeklyOrdersService } from '../../../application/use-cases/list-all-weekly-orders.use-cases';
import { EmployeeWeeklyOrdersEntityInterface } from 'src/domain/repositories/employee-weekly-orders.repository.interface';

@ApiTags('Pedidos Semanais dos Funcionários')
@Controller('employee-weekly-orders')
export class EmployeeWeeklyOrdersController {
  constructor(
    private readonly createOrUpdateWeeklyOrderService: CreateOrUpdateWeeklyOrderService,
    private readonly getWeeklyOrdersByEmployeeService: GetWeeklyOrdersByEmployeeService,
    private readonly deleteWeeklyOrderService: DeleteWeeklyOrderService,
    private readonly listAllWeeklyOrdersService: ListAllWeeklyOrdersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os pedidos semanais',
    description:
      'Retorna todos os pedidos semanais do sistema com detalhes do funcionário e prato',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos os pedidos semanais',
    schema: {
      type: 'array',
      example: [
        {
          id: 1,
          employeeId: 1,
          employeeName: 'João Silva',
          employeeEmail: 'joao@email.com',
          dayOfWeek: 'Monday',
          orderItemId: 10,
          dish: {
            id: 5,
            name: 'Feijoada',
            price: 25.9,
            image: 'https://...',
            restaurantId: 3,
          },
          createdAt: '2025-11-27T10:00:00.000Z',
          updatedAt: '2025-11-27T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async getAllWeeklyOrders(@Res() res: Response): Promise<void> {
    try {
      const orders = await this.listAllWeeklyOrdersService.execute();
      res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar pedidos semanais',
      });
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar ou atualizar pedido semanal',
    description:
      'Cria um novo pedido semanal ou atualiza um existente para o funcionário no dia especificado',
  })
  @ApiBody({
    description: 'Dados do pedido semanal a serem criados',
    type: CreateEmployeeWeeklyOrderDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pedido semanal criado/atualizado com sucesso',
    type: CreateEmployeeWeeklyOrderDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na criação do pedido',
    type: Http400,
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async createOrUpdateWeeklyOrder(
    @Body() employeeWeeklyOrder: EmployeeWeeklyOrdersEntityInterface,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const result =
        await this.createOrUpdateWeeklyOrderService.execute(
          employeeWeeklyOrder,
        );
      res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar/atualizar pedido semanal',
      });
    }
  }

  @Get('employee/:employeeId')
  @ApiOperation({
    summary: 'Buscar pedidos semanais por funcionário',
    description:
      'Retorna todos os pedidos semanais de um funcionário específico (um pedido para cada dia da semana)',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'ID do funcionário',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pedidos semanais do funcionário',
    type: [EmployeeWeeklyOrderResponse],
  })
  @ApiResponse({
    status: 404,
    description: 'Funcionário não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async getWeeklyOrdersByEmployee(
    @Param('employeeId') employeeId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const orders =
        await this.getWeeklyOrdersByEmployeeService.execute(employeeId);
      res.status(HttpStatus.OK).json(orders);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar pedidos semanais',
      });
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir pedido semanal',
    description: 'Remove um pedido semanal específico do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido semanal',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pedido semanal excluído com sucesso',
    schema: {
      example: {
        success: true,
        message: 'Pedido semanal excluído com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido semanal não encontrado',
    type: Http404,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async deleteWeeklyOrder(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.deleteWeeklyOrderService.execute(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Pedido semanal excluído com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao excluir pedido semanal',
      });
    }
  }
}
