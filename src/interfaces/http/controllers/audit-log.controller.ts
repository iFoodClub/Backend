/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditLogService } from '../../../infrastructure/services/audit-log.service';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar logs de auditoria recentes',
    description:
      'Retorna os logs mais recentes de auditoria do sistema. Útil para visão geral das atividades.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de logs a retornar (padrão: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs retornada com sucesso',
    schema: {
      type: 'array',
      example: [
        {
          _id: '674589abc123def456789012',
          eventType: 'ORDER_CREATED',
          entityType: 'Order',
          entityId: 123,
          userId: 45,
          metadata: { orderType: 'individual', total: 29.9 },
          createdAt: '2025-11-26T10:30:00.000Z',
          updatedAt: '2025-11-26T10:30:00.000Z',
        },
      ],
    },
  })
  async findRecent(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return await this.auditLogService.findRecent(parsedLimit);
  }

  @Get('by-entity')
  @ApiOperation({
    summary: 'Buscar logs por entidade específica',
    description:
      'Retorna todos os logs de auditoria relacionados a uma entidade específica (ex: Order #123, Dish #45)',
  })
  @ApiQuery({
    name: 'entityType',
    required: true,
    type: String,
    description: 'Tipo da entidade',
    example: 'Order',
  })
  @ApiQuery({
    name: 'entityId',
    required: true,
    type: Number,
    description: 'ID da entidade no PostgreSQL',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico completo da entidade',
    schema: {
      type: 'array',
      example: [
        {
          eventType: 'ORDER_CREATED',
          entityType: 'Order',
          entityId: 123,
          userId: 45,
          metadata: { status: 'pending' },
          createdAt: '2025-11-26T10:30:00.000Z',
        },
        {
          eventType: 'ORDER_CONFIRMED',
          entityType: 'Order',
          entityId: 123,
          userId: 45,
          metadata: { status: 'confirmed' },
          createdAt: '2025-11-26T10:35:00.000Z',
        },
      ],
    },
  })
  async findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return await this.auditLogService.findByEntity(
      entityType,
      parseInt(entityId),
    );
  }

  @Get('by-user')
  @ApiOperation({
    summary: 'Buscar logs por usuário',
    description:
      'Retorna todas as ações realizadas por um usuário específico no sistema',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    type: Number,
    description: 'ID do usuário',
    example: 45,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de logs a retornar (padrão: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de ações do usuário',
    schema: {
      type: 'array',
      example: [
        {
          eventType: 'ORDER_CREATED',
          entityType: 'Order',
          entityId: 123,
          userId: 45,
          metadata: { action: 'created_order' },
          createdAt: '2025-11-26T10:30:00.000Z',
        },
      ],
    },
  })
  async findByUser(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return await this.auditLogService.findByUser(parseInt(userId), parsedLimit);
  }

  @Get('by-event-type')
  @ApiOperation({
    summary: 'Buscar logs por tipo de evento',
    description:
      'Filtra logs por tipo de evento específico (ex: ORDER_CREATED, USER_LOGIN, DISH_UPDATED)',
  })
  @ApiQuery({
    name: 'eventType',
    required: true,
    type: String,
    description: 'Tipo do evento',
    example: 'ORDER_CREATED',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de logs a retornar (padrão: 100)',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Logs filtrados por tipo de evento',
    schema: {
      type: 'array',
      example: [
        {
          eventType: 'ORDER_CREATED',
          entityType: 'Order',
          entityId: 123,
          userId: 45,
          metadata: { orderType: 'company' },
          createdAt: '2025-11-26T10:30:00.000Z',
        },
      ],
    },
  })
  async findByEventType(
    @Query('eventType') eventType: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return await this.auditLogService.findByEventType(eventType, parsedLimit);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas de eventos de auditoria',
    description:
      'Retorna contagem agregada de eventos por tipo. Útil para dashboards e análises.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas agregadas',
    schema: {
      type: 'array',
      example: [
        {
          _id: 'ORDER_CREATED',
          count: 1523,
        },
        {
          _id: 'USER_LOGIN',
          count: 892,
        },
        {
          _id: 'ORDER_CANCELLED',
          count: 143,
        },
      ],
    },
  })
  async getStats() {
    return await this.auditLogService.getStatsByEventType();
  }
}
