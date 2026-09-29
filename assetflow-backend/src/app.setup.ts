import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProblemDetailsFilter } from './common/filters/problem-details.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  REQUEST_ID_HEADER,
  requestIdMiddleware,
} from './common/middleware/request-id.middleware';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.use(requestIdMiddleware);

  app.enableCors({
    origin: config.get<string>('app.corsOrigin'),
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER], // lets the frontend read it
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip fields not in the DTO
      forbidNonWhitelisted: true, // …or reject them with 400
      transform: true, // plain JSON → DTO class instance
    }),
  );

  app.useGlobalFilters(new ProblemDetailsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableShutdownHooks();
}