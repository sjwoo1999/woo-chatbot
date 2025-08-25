import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { GlobalExceptionFilter } from './safety/exception-filter';
import { TelemetryMiddleware } from './telemetry/telemetry.middleware';
import { TelemetryService } from './telemetry/telemetry.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const telemetry = app.get(TelemetryService);
  app.useGlobalFilters(new GlobalExceptionFilter(telemetry));
  app.use(new TelemetryMiddleware(telemetry).use.bind(new TelemetryMiddleware(telemetry)));

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
