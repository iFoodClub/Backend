import { Module, Global } from '@nestjs/common';
import { CloudWatchLoggerService } from '../../infrastructure/services/cloudwatch-logger.service';
import { CloudWatchMetricsService } from '../../infrastructure/services/cloudwatch-metrics.service';
import { MetricsInterceptor } from '../../infrastructure/observability/metrics.interceptor';

@Global()
@Module({
  providers: [
    CloudWatchLoggerService,
    CloudWatchMetricsService,
    MetricsInterceptor,
  ],
  exports: [
    CloudWatchLoggerService,
    CloudWatchMetricsService,
    MetricsInterceptor,
  ],
})
export class ObservabilityModule {}
