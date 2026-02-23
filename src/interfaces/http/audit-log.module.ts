/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditLog, AuditLogSchema } from '../../domain/models/audit-log.schema';
import { AuditLogService } from '../../infrastructure/services/audit-log.service';
import { AuditLogController } from './controllers/audit-log.controller';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('DOCUMENTDB_URI');
        // MongoDB Atlas não precisa de configuração SSL adicional
        // DocumentDB (AWS) precisaria de tlsCAFile
        const isAtlas = uri?.includes('mongodb.net');

        return {
          uri,
          ...(isAtlas
            ? {}
            : {
                tls: true,
                tlsCAFile: configService.get<string>('DOCUMENTDB_CA_FILE'),
                retryWrites: false,
              }),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
