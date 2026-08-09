import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      service: 'project-service',
    }),
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3002);

  // Middleware global para contexto de tenant
  app.use(TenantContextMiddleware);

  // Pipe de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor de transformación de respuestas
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await app.listen(port);
  console.log(`Project Service running on port ${port}`);
}

bootstrap();
