/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../services/audit-log.service';

/**
 * Interceptor para registrar eventos de auditoria automaticamente
 * Use com @UseInterceptors(AuditInterceptor) em rotas importantes
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Determinar tipo de evento baseado na rota
    const eventType = this.getEventType(method, url);

    return next.handle().pipe(
      tap(async (data) => {
        // Registrar apenas se for uma operação importante
        if (eventType) {
          await this.auditLogService.create({
            eventType,
            entityType: this.getEntityType(url),
            entityId: data?.id,
            userId: user?.userId,
            description: `${method} ${url}`,
            ipAddress: ip,
            userAgent: headers['user-agent'],
            metadata: {
              method,
              url,
              responseStatus: 'success',
            },
          });
        }
      }),
    );
  }

  private getEventType(method: string, url: string): string | null {
    // Mapear rotas para eventos
    if (url.includes('/orders') && method === 'POST') return 'ORDER_CREATED';
    if (url.includes('/orders') && method === 'DELETE')
      return 'ORDER_CANCELLED';
    if (url.includes('/auth/login')) return 'USER_LOGIN';
    if (url.includes('/users') && method === 'POST') return 'USER_CREATED';

    // Adicione mais mapeamentos conforme necessário
    return null;
  }

  private getEntityType(url: string): string {
    if (url.includes('/orders')) return 'Order';
    if (url.includes('/users')) return 'User';
    if (url.includes('/restaurants')) return 'Restaurant';
    if (url.includes('/dishes')) return 'Dish';
    return 'Unknown';
  }
}
