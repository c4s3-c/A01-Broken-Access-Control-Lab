import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 1: Over-fetching
 * 
 * Los resolvers de Query NO filtran por el tenant del contexto.
 * Esto permite que un usuario de un tenant consulte proyectos de OTRO tenant.
 */
export const queryResolvers = {
  Query: {
    /**
     * ⚠️ VULNERABLE: Si filter.tenantId está presente, lo usa directamente
     * sin verificar que coincida con context.tenantId.
     * Si no está presente, devuelve proyectos de TODOS los tenants.
     */
    projects: async (_: unknown, args: { filter?: { status?: string; tenantId?: string; search?: string }; pagination?: { page: number; limit: number } }) => {
      const { filter, pagination } = args;
      // ❌ NO valida que filter.tenantId === context.tenantId
      return projectService.findAll(filter || {}, pagination || { page: 1, limit: 20 });
    },

    /**
     * ⚠️ VULNERABLE: Devuelve un proyecto específico sin validar
     * que el usuario autenticado tenga acceso a ese tenant.
     */
    project: async (_: unknown, args: { id: string }) => {
      // ❌ NO valida ownership del proyecto
      return projectService.findById(args.id);
    },

    /**
     * ⚠️ VULNERABLE: Devuelve TODOS los tenants del sistema sin restricción.
     * Un usuario de cualquier tenant puede ver información de todos los tenants,
     * incluyendo adminEmail (dato sensible).
     */
    tenants: async () => {
      // ❌ Sin filtrado por contexto del usuario
      return projectService.findAllTenants();
    },
  },
};
