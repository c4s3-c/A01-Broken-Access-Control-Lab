import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3004);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');

  // Set global API prefix
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS for development
  app.enableCors({
    origin: process.env.NODE_ENV === 'development' ? '*' : false,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global middleware
  app.use(LoggingMiddleware);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Swagger documentation (only in development)
  if (process.env.NODE_ENV === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('Authentication & Authorization Service for ProjectFlow Security Lab')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║           Auth Service is running                         ║
  ╠═══════════════════════════════════════════════════════════╣
  ║  Environment: ${process.env.NODE_ENV?.padEnd(42)}║
  ║  Port:        ${port.toString().padEnd(42)}║
  ║  API Prefix:  ${apiPrefix.padEnd(42)}║
  ║  Docs:        http://localhost:${port}/docs${' '.padEnd(26 - port.toString().length)}║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
