import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { TenantSettings } from '../settings/entities/tenant-settings.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(TenantSettings)
    private settingsRepo: Repository<TenantSettings>,
  ) {}

  // ❌ VULNERABILIDAD CRÍTICA: Exporta TODOS los proyectos del tenant
  async exportAllProjects(tenantId: string): Promise<any[]> {
    const projects = await this.projectRepo.find({ where: { tenantId } });
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
    }));
  }

  // ❌ VULNERABILIDAD CRÍTICA: Elimina múltiples proyectos sin validación adicional
  async bulkDeleteProjects(projectIds: string[], tenantId: string): Promise<number> {
    const result = await this.projectRepo
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids: projectIds })
      .andWhere('tenantId = :tenantId', { tenantId })
      .execute();

    return result.affected || 0;
  }

  // ❌ VULNERABILIDAD: Expone configuración sensible incluyendo API keys
  async getTenantSettings(tenantId: string): Promise<any> {
    let settings = await this.settingsRepo.findOneBy({ tenantId });

    if (!settings) {
      settings = this.settingsRepo.create({
        tenantId,
        settings: {},
        apiKeys: { public: 'pk_test_123', secret: 'sk_live_SECRET_KEY' },
        webhookUrls: ['https://webhook.example.com'],
        integrations: { slack: true, github: true },
      });
      await this.settingsRepo.save(settings);
    }

    return {
      settings: settings.settings,
      apiKeys: settings.apiKeys,
      webhookUrls: settings.webhookUrls,
      integrations: settings.integrations,
    };
  }

  // ❌ VULNERABILIDAD CRÍTICA: Modifica configuración sin validación de ownership real
  async updateTenantSettings(tenantId: string, newSettings: any): Promise<any> {
    let settings = await this.settingsRepo.findOneBy({ tenantId });

    if (!settings) {
      settings = this.settingsRepo.create({ tenantId });
    }

    Object.assign(settings, {
      settings: newSettings.settings || settings.settings,
      apiKeys: newSettings.apiKeys || settings.apiKeys,
      webhookUrls: newSettings.webhookUrls || settings.webhookUrls,
      integrations: newSettings.integrations || settings.integrations,
    });

    return this.settingsRepo.save(settings);
  }
}
