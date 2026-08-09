import { AppDataSource } from '../config/env';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Tenant } from '../entities/tenant.entity';
import { ProjectMember } from '../entities/project-member.entity';

/**
 * Servicio para operaciones con Proyectos.
 * ⚠️ Los métodos NO validan permisos ni ownership - eso se hace (incorrectamente)
 * en los resolvers de GraphQL.
 */
export class ProjectService {
  private projectRepo = AppDataSource.getRepository(Project);
  private tenantRepo = AppDataSource.getRepository(Tenant);
  private memberRepo = AppDataSource.getRepository(ProjectMember);

  /**
   * ⚠️ VULNERABLE: Encuentra proyectos SIN filtrar por tenant del usuario.
   * Si filter.tenantId está presente, filtra por ese tenant (cualquiera).
   * Si no, devuelve TODOS los proyectos de TODOS los tenants.
   */
  async findAll(
    filter: { status?: string; tenantId?: string; search?: string },
    pagination: { page: number; limit: number }
  ) {
    const queryBuilder = this.projectRepo.createQueryBuilder('project');

    // ⚠️ VULNERABLE: Aplica filtro tenantId directamente sin validar contexto
    if (filter.tenantId) {
      queryBuilder.andWhere('project.tenantId = :tenantId', { tenantId: filter.tenantId });
    }

    if (filter.status) {
      queryBuilder.andWhere('project.status = :status', { status: filter.status });
    }

    if (filter.search) {
      queryBuilder.andWhere('project.name ILIKE :search', { search: `%${filter.search}%` });
    }

    const [items, total] = await queryBuilder
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async findById(id: string) {
    return this.projectRepo.findOne({ where: { id } });
  }

  /**
   * ⚠️ VULNERABLE: Devuelve TODOS los tenants del sistema.
   * Expone adminEmail y otros datos sensibles.
   */
  async findAllTenants() {
    return this.tenantRepo.find();
  }
}
