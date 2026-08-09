/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 1: Over-fetching
 * 
 * Los resolvers de Tenant exponen todos los campos sin restricción,
 * incluyendo adminEmail que es un dato sensible.
 */
export const tenantResolvers = {
  Tenant: {
    // ❌ Expone todos los campos directamente sin validación
    // adminEmail es particularmente sensible y no debería ser accesible
    // para usuarios de otros tenants
  },
};
