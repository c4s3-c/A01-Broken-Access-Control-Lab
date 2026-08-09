import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { HeaderAuthGuard } from '../projects/guards/header-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExportDataDto } from './dto/export-data.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';

// ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
// Todos estos endpoints administrativos confían en los headers inyectados.
// Si un atacante puede inyectar x-user-role: ADMIN u OWNER, obtiene acceso total.

@Controller('admin')
@UseGuards(HeaderAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ❌ VULNERABILIDAD CRÍTICA: Exporta TODOS los proyectos del tenant
  // Requiere rol ADMIN u OWNER (del header inyectado)
  @Get('projects/export')
  @Roles('ADMIN', 'OWNER')
  async exportProjects(@CurrentUser() user: any) {
    const data = await this.adminService.exportAllProjects(user.tenantId);
    return {
      data,
      exportDate: new Date().toISOString(),
      totalRecords: data.length,
    };
  }

  // ❌ VULNERABILIDAD CRÍTICA: Elimina múltiples proyectos
  // Requiere rol OWNER (del header inyectado)
  @Post('projects/bulk-delete')
  @Roles('OWNER')
  async bulkDelete(@CurrentUser() user: any, @Body() dto: BulkDeleteDto) {
    const deletedCount = await this.adminService.bulkDeleteProjects(dto.projectIds, user.tenantId);
    return {
      deletedCount,
      message: `${deletedCount} projects deleted successfully`,
    };
  }

  // ❌ VULNERABILIDAD: Expone configuración sensible del tenant
  @Get('tenant/settings')
  @Roles('ADMIN', 'OWNER')
  async getTenantSettings(@CurrentUser() user: any) {
    const settings = await this.adminService.getTenantSettings(user.tenantId);
    return { settings };
  }

  // ❌ VULNERABILIDAD CRÍTICA: Modifica configuración del tenant
  // Requiere rol OWNER (del header inyectado)
  @Put('tenant/settings')
  @Roles('OWNER')
  async updateTenantSettings(@CurrentUser() user: any, @Body() body: any) {
    const settings = await this.adminService.updateTenantSettings(user.tenantId, body.settings);
    return { settings, message: 'Settings updated successfully' };
  }
}
