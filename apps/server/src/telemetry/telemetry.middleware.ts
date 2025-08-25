import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { TelemetryService } from './telemetry.service';

@Injectable()
export class TelemetryMiddleware implements NestMiddleware {
  constructor(private readonly telemetry: TelemetryService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const path = req.path;
    const method = req.method;

    res.on('finish', () => {
      const latencyMs = Date.now() - start;
      void this.telemetry.logEvent('http_request', {
        path,
        method,
        statusCode: res.statusCode,
        latencyMs,
      });
    });

    next();
  }
}
