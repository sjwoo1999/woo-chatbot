import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { GlobalExceptionFilter } from './safety/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
