import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, TypeOrmModule],
  controllers: [HealthController],
})
export class HealthModule {}
