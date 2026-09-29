import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('app.corsOrigin'),
    credentials: true,
  });

  app.enableShutdownHooks(); // closes DB connections cleanly on stop

  const port = config.get<number>('app.port', 4000);
  await app.listen(port);

  Logger.log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();