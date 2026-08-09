import { Controller, Get, Put, Body, UseGuards, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { HeaderAuthGuard } from '../projects/guards/header-auth.guard';

@Controller('settings')
@UseGuards(HeaderAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const settings = await this.settingsService.getTenantSettings(tenantId);
    return { settings };
  }

  @Put()
  async updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: any,
  ) {
    const settings = await this.settingsService.updateTenantSettings(tenantId, body);
    return { settings, message: 'Settings updated successfully' };
  }
}
