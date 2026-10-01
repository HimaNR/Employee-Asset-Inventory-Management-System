import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('AssetFlow API')
    .setDescription('Employee Asset & Inventory Management System – REST API')
    .setVersion('1.0')
    .addBearerAuth()
    // Every endpoint needs a token unless marked @Public()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: { persistAuthorization: true }, // keep the token after a page refresh
  });
}
