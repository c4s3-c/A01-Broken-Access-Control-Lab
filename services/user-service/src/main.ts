import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      service: 'user-service',
    }),
  });

  const configService = app.get(ConfigService);
  
  // Habilitar trust proxy para obtener IP real detrás del gateway
  if (configService.get<string>('TRUST_PROXY') === 'true') {
    app.set('trust proxy', true);
  }

  // Pipe de validación global
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

  // Filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor de transformación de respuestas global
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  
  console.log(`User Service listening on port ${port}`);
}

bootstrap();
