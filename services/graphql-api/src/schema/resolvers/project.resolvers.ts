import { TenantService } from '../services/tenant.service';

const tenantService = new TenantService();

/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 1: Over-fetching
 * 
 * Los resolvers anidados de Project NO validan que el tenant
 * del proyecto coincida con el tenant del usuario autenticado.
 */
export const projectResolvers = {
  Project: {
    /**
     * ⚠️ VULNERABLE: Devuelve el tenant del proyecto SIN verificar
     * que el tenant coincida con el contexto del usuario autenticado.
     * Un usuario del tenant "acme" puede acceder a datos del tenant "globex"
     * simplemente consultando un proyecto que pertenezca a "globex".
     */
    tenant: async (parent: { tenantId: string }) => {
      // ❌ NO valida que parent.tenantId === context.tenantId
      // Simplemente busca y devuelve el tenant
      return tenantService.findById(parent.tenantId);
    },

    /**
     * ⚠️ VULNERABLE: Devuelve todos los miembros sin filtrar por permisos
     * o validar que el usuario tenga acceso a ese proyecto.
     */
    members: async (parent: { id: string }) => {
      // ❌ Sin validación de permisos
      return tenantService.findMembersByProjectId(parent.id);
    },
  },
};
