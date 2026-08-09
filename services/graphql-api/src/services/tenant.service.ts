import { AppDataSource } from '../config/env';
import { Tenant } from '../entities/tenant.entity';
import { ProjectMember } from '../entities/project-member.entity';

/**
 * Servicio para operaciones con Tenants.
 * ⚠️ Los métodos NO validan permisos ni ownership.
 */
export class TenantService {
  private tenantRepo = AppDataSource.getRepository(Tenant);
  private memberRepo = AppDataSource.getRepository(ProjectMember);

  async findById(id: string) {
    // ⚠️ VULNERABLE: Devuelve el tenant sin validar contexto del usuario
    return this.tenantRepo.findOne({ where: { id } });
  }

  async findAll() {
    // ⚠️ VULNERABLE: Devuelve TODOS los tenants sin restricción
    return this.tenantRepo.find();
  }

  /**
   * ⚠️ VULNERABLE: Devuelve miembros de un proyecto sin validar
   * que el usuario tenga acceso a ese proyecto.
   */
  async findMembersByProjectId(projectId: string) {
    return this.memberRepo.find({ where: { projectId } });
  }
}
