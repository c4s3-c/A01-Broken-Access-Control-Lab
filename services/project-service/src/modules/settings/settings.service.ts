import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantSettings } from './entities/tenant-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(TenantSettings)
    private settingsRepo: Repository<TenantSettings>,
  ) {}

  async getTenantSettings(tenantId: string): Promise<any> {
    let settings = await this.settingsRepo.findOneBy({ tenantId });

    if (!settings) {
      settings = this.settingsRepo.create({
        tenantId,
        settings: { theme: 'light', language: 'en' },
        apiKeys: { public: 'pk_test_xxx' },
        webhookUrls: [],
        integrations: {},
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

  async updateTenantSettings(tenantId: string, newSettings: any): Promise<any> {
    let settings = await this.settingsRepo.findOneBy({ tenantId });

    if (!settings) {
      settings = this.settingsRepo.create({ tenantId });
    }

    Object.assign(settings, newSettings);
    return this.settingsRepo.save(settings);
  }
}
