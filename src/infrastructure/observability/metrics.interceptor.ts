/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CloudWatchMetricsService } from '../services/cloudwatch-metrics.service';
import { CloudWatchLoggerService } from '../services/cloudwatch-logger.service';
import { RequestContextService } from './request-context.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private metricsService: CloudWatchMetricsService,
    private logger: CloudWatchLoggerService,
    private requestContextService: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = this.requestContextService.getRequestId();
    const startTime = Date.now();

    // Ignorar health checks para não poluir logs/métricas
    const isHealthCheck = url === '/health-check' || url === '/health';
    if (isHealthCheck) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log da requisição
        this.logger.log(
          {
            requestId,
            traceparent: this.requestContextService.get()?.traceparent,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userAgent: request.headers['user-agent'],
          },
          'HTTP',
        );

        // Enviar métricas
        void this.metricsService
          .recordApiRequest(
            this.sanitizeEndpoint(url),
            method,
            statusCode,
            duration,
          )
          .catch(() => undefined);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Log do erro
        this.logger.error(
          {
            requestId,
            traceparent: this.requestContextService.get()?.traceparent,
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
          },
          error.stack,
          'HTTP',
        );

        // Métricas em background (catchError deve retornar Observable, não Promise)
        void this.metricsService
          .recordApiRequest(
            this.sanitizeEndpoint(url),
            method,
            error.status || 500,
            duration,
          )
          .catch(() => undefined);
        void this.metricsService
          .recordError(error.name || 'UnknownError', 'HTTP')
          .catch(() => undefined);

        return throwError(() => error);
      }),
    );
  }

  private sanitizeEndpoint(url: string): string {
    // Remove IDs e query params para agrupar endpoints similares
    return url
      .split('?')[0]
      .replace(/\/\d+/g, '/:id')
      .replace(
        /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        '/:uuid',
      );
  }
}
