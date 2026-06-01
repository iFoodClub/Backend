import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const incomingRequestId =
      req.get('x-request-id')?.trim() || req.get('x-correlation-id')?.trim();
    const requestId = incomingRequestId || randomUUID();

    res.setHeader('x-request-id', requestId);

    this.requestContextService.run(
      {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        traceparent: req.get('traceparent')?.trim(),
      },
      () => next(),
    );
  }
}