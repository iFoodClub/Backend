import { Module } from '@nestjs/common';
import { DatabaseController } from './controllers/database.controller';

@Module({
  controllers: [DatabaseController],
})
export class DatabaseModule {}
