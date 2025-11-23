import { Injectable } from '@nestjs/common';
import {
  CloudWatchClient,
  PutMetricDataCommand,
  StandardUnit,
} from '@aws-sdk/client-cloudwatch';
import { ConfigService } from '@nestjs/config';

interface MetricData {
  metricName: string;
  value: number;
  unit?: StandardUnit;
  dimensions?: Record<string, string>;
}

@Injectable()
export class CloudWatchMetricsService {
  private client: CloudWatchClient;
  private namespace: string;
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'sa-east-1');
    this.namespace = this.configService.get<string>(
      'CLOUDWATCH_NAMESPACE',
      'FoodClub/Backend',
    );

    // Só inicializa se as credenciais AWS estiverem configuradas
    const awsAccessKey = this.configService.get<string>(
      'AWS_ACCESS_KEY_ID_CLOUDWATCH',
    );
    const awsSecretKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY_CLOUDWATCH',
    );
    this.isEnabled = !!(awsAccessKey && awsSecretKey);

    if (this.isEnabled) {
      this.client = new CloudWatchClient({
        region,
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsSecretKey,
        },
      });
    }
  }

  async putMetric(data: MetricData) {
    if (!this.isEnabled) return;

    try {
      const dimensions = data.dimensions
        ? Object.entries(data.dimensions).map(([Name, Value]) => ({
            Name,
            Value,
          }))
        : [];

      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: [
          {
            MetricName: data.metricName,
            Value: data.value,
            Unit: data.unit || StandardUnit.None,
            Timestamp: new Date(),
            Dimensions: dimensions,
          },
        ],
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Failed to put metric to CloudWatch:', error);
    }
  }

  // Métricas específicas do negócio
  async recordApiRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
  ) {
    await Promise.all([
      this.putMetric({
        metricName: 'ApiRequestCount',
        value: 1,
        unit: StandardUnit.Count,
        dimensions: {
          Endpoint: endpoint,
          Method: method,
          StatusCode: statusCode.toString(),
        },
      }),
      this.putMetric({
        metricName: 'ApiRequestDuration',
        value: duration,
        unit: StandardUnit.Milliseconds,
        dimensions: { Endpoint: endpoint, Method: method },
      }),
    ]);
  }

  async recordOrderCreated(orderType: 'individual' | 'company') {
    await this.putMetric({
      metricName: 'OrdersCreated',
      value: 1,
      unit: StandardUnit.Count,
      dimensions: { OrderType: orderType },
    });
  }

  async recordDatabaseQuery(
    operation: string,
    duration: number,
    success: boolean,
  ) {
    await Promise.all([
      this.putMetric({
        metricName: 'DatabaseQueryCount',
        value: 1,
        unit: StandardUnit.Count,
        dimensions: { Operation: operation, Success: success.toString() },
      }),
      this.putMetric({
        metricName: 'DatabaseQueryDuration',
        value: duration,
        unit: StandardUnit.Milliseconds,
        dimensions: { Operation: operation },
      }),
    ]);
  }

  async recordError(errorType: string, context: string) {
    await this.putMetric({
      metricName: 'ErrorCount',
      value: 1,
      unit: StandardUnit.Count,
      dimensions: { ErrorType: errorType, Context: context },
    });
  }
}
