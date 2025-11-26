/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from '../../../infrastructure/services/audit-log.service';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria recentes' })
  async findRecent(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return await this.auditLogService.findRecent(parsedLimit);
  }

  @Get('by-entity')
  @ApiOperation({ summary: 'Buscar logs por entidade' })
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
  @ApiOperation({ summary: 'Buscar logs por usuário' })
  async findByUser(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return await this.auditLogService.findByUser(parseInt(userId), parsedLimit);
  }

  @Get('by-event-type')
  @ApiOperation({ summary: 'Buscar logs por tipo de evento' })
  async findByEventType(
    @Query('eventType') eventType: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return await this.auditLogService.findByEventType(eventType, parsedLimit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de eventos' })
  async getStats() {
    return await this.auditLogService.getStatsByEventType();
  }
}
