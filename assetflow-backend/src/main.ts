import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { setupSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);
  setupSwagger(app);

  const port = app.get(ConfigService).get<number>('app.port', 4000);
  await app.listen(port);

  Logger.log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger docs on http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();