/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, LoggerService } from '@nestjs/common';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudWatchLoggerService implements LoggerService {
  private client: CloudWatchLogsClient;
  private logGroupName: string;
  private logStreamName: string;
  private sequenceToken: string | undefined;
  private logQueue: Array<{ timestamp: number; message: string }> = [];
  private flushInterval: NodeJS.Timeout;
  private isInitialized = false;
  private isEnabled = false;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.logGroupName = this.configService.get<string>(
      'CLOUDWATCH_LOG_GROUP',
      '/aws/foodclub/backend',
    );
    this.logStreamName = `${this.configService.get<string>('NODE_ENV', 'production')}-${Date.now()}`;

    // Só inicializa CloudWatch se as credenciais AWS estiverem configuradas
    const awsAccessKey = this.configService.get<string>(
      'AWS_ACCESS_KEY_ID_CLOUDWATCH',
    );
    const awsSecretKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY_CLOUDWATCH',
    );
    this.isEnabled = !!(awsAccessKey && awsSecretKey);

    if (this.isEnabled) {
      this.client = new CloudWatchLogsClient({
        region,
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
        },
      });
      void this.initialize();

      // Flush logs a cada 5 segundos
      this.flushInterval = setInterval(() => this.flushLogs(), 5000);
    }
  }

  private async initialize() {
    try {
      // Criar log stream se não existir
      await this.client.send(
        new CreateLogStreamCommand({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
        }),
      );
      this.isInitialized = true;
    } catch (error) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        console.error('Failed to initialize CloudWatch logger:', error);
      } else {
        this.isInitialized = true;
      }
    }
  }

  private async getSequenceToken() {
    try {
      const response = await this.client.send(
        new DescribeLogStreamsCommand({
          logGroupName: this.logGroupName,
          logStreamNamePrefix: this.logStreamName,
        }),
      );
      return response.logStreams?.[0]?.uploadSequenceToken;
    } catch (error) {
      console.error('Failed to get sequence token:', error);
      return undefined;
    }
  }

  private async flushLogs() {
    if (!this.isInitialized || this.logQueue.length === 0) return;

    try {
      if (!this.sequenceToken) {
        this.sequenceToken = await this.getSequenceToken();
      }

      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: this.logQueue.map((log) => ({
          timestamp: log.timestamp,
          message: log.message,
        })),
        sequenceToken: this.sequenceToken,
      });

      const response = await this.client.send(command);
      this.sequenceToken = response.nextSequenceToken;
      this.logQueue = [];
    } catch (error) {
      console.error('Failed to flush logs to CloudWatch:', error);
    }
  }

  private addToQueue(level: string, message: any, context?: string) {
    const timestamp = Date.now();
    const formattedMessage = JSON.stringify({
      level,
      timestamp: new Date(timestamp).toISOString(),
      context: context || 'Application',
      message: typeof message === 'object' ? JSON.stringify(message) : message,
    });

    if (this.isEnabled) {
      this.logQueue.push({ timestamp, message: formattedMessage });
    }

    // Sempre loga no console também
    console.log(formattedMessage);
  }

  log(message: any, context?: string) {
    this.addToQueue('INFO', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.addToQueue('ERROR', { message, trace }, context);
  }

  warn(message: any, context?: string) {
    this.addToQueue('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.addToQueue('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.addToQueue('VERBOSE', message, context);
  }

  async onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushLogs();
  }
}
