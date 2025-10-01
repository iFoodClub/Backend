import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health-check')
@Controller('health-check')
export class HealthCheckController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Server is running' })
  healthCheck(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'Is Alive!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({ status: 200, description: 'Returns pong' })
  ping(): string {
    return 'pong';
  }
}