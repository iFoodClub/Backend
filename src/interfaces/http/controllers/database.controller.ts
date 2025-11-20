/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@ApiTags('database')
@Controller('database')
export class DatabaseController {
  private seedsExecuted = false;

  @Post('run-seeds')
  @ApiOperation({
    summary: 'Executa os seeders do banco de dados (usar apenas 1 vez)',
  })
  @ApiQuery({
    name: 'secret',
    required: true,
    description: 'Secret key para autorização',
  })
  @ApiResponse({ status: 200, description: 'Seeders executados com sucesso' })
  @ApiResponse({
    status: 403,
    description: 'Secret inválido ou seeders já executados',
  })
  async runSeeds(@Query('secret') secret: string) {
    // Validação de secret (use uma env var ou string fixa)
    const expectedSecret = process.env.SEED_SECRET || 'change-me-in-production';

    if (secret !== expectedSecret) {
      return {
        success: false,
        message: 'Invalid secret key',
      };
    }

    if (this.seedsExecuted) {
      return {
        success: false,
        message: 'Seeds already executed in this instance',
      };
    }

    try {
      const { stdout, stderr } = await execAsync(
        'npx sequelize-cli db:seed:all --config src/infrastructure/database/config.js',
      );

      this.seedsExecuted = true;

      return {
        success: true,
        message: 'Seeds executed successfully',
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error executing seeds',
        error: error.message,
      };
    }
  }

  @Post('run-migrations')
  @ApiOperation({ summary: 'Executa as migrations do banco de dados' })
  @ApiQuery({
    name: 'secret',
    required: true,
    description: 'Secret key para autorização',
  })
  @ApiResponse({
    status: 200,
    description: 'Migrations executadas com sucesso',
  })
  async runMigrations(@Query('secret') secret: string) {
    const expectedSecret = process.env.SEED_SECRET || 'change-me-in-production';

    if (secret !== expectedSecret) {
      return {
        success: false,
        message: 'Invalid secret key',
      };
    }

    try {
      const { stdout, stderr } = await execAsync(
        'npx sequelize-cli db:migrate --config src/infrastructure/database/config.js',
      );

      return {
        success: true,
        message: 'Migrations executed successfully',
        output: stdout,
        errors: stderr || null,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error executing migrations',
        error: error.message,
      };
    }
  }
}
