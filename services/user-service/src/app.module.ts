import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { HealthModule } from './health/health.module';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Conexión a PostgreSQL con TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigModule],
      useFactory: databaseConfig,
    }),
    
    // Módulos de feature
    UsersModule,
    RolesModule,
    HealthModule,
  ],
  providers: [TenantContextMiddleware],
})
export class AppModule {}
