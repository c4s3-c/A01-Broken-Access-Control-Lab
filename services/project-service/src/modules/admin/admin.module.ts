import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { TenantSettings } from '../settings/entities/tenant-settings.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, TenantSettings])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
