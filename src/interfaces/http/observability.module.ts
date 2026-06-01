import { Module, Global } from '@nestjs/common';
import { CloudWatchLoggerService } from '../../infrastructure/services/cloudwatch-logger.service';
import { CloudWatchMetricsService } from '../../infrastructure/services/cloudwatch-metrics.service';
import { MetricsInterceptor } from '../../infrastructure/observability/metrics.interceptor';
import { RequestContextService } from '../../infrastructure/observability/request-context.service';

@Global()
@Module({
  providers: [
    RequestContextService,
    CloudWatchLoggerService,
    CloudWatchMetricsService,
    MetricsInterceptor,
  ],
  exports: [
    RequestContextService,
    CloudWatchLoggerService,
    CloudWatchMetricsService,
    MetricsInterceptor,
  ],
})
export class ObservabilityModule {}
