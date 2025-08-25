import { ArgumentsHost, Catch, ExceptionFilter, ForbiddenException, HttpException } from '@nestjs/common';
import { TelemetryService } from '../telemetry/telemetry.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly telemetry?: TelemetryService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    if (exception instanceof ForbiddenException) {
      const r = exception.getResponse();
      // log safety block
      this.telemetry?.logEvent('safety_block', { detail: r }).catch(() => {});
      res.status(403).json({ type: 'safety_error', detail: r });
      return;
    }

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({ type: 'http_error', message: exception.message });
      return;
    }

    res.status(500).json({ type: 'server_error', message: 'Internal Server Error' });
  }
}
