import { Request } from 'express';

/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 3 (conexión con API Gateway)
 * 
 * Este middleware extrae los headers x-* inyectados por el API Gateway
 * y los pasa al contexto de GraphQL. NO hay validación de que estos
 * headers sean legítimos o correspondan a un JWT válido.
 * 
 * Si un atacante logra bypass del API Gateway o inyecta headers directamente,
 * este servicio los aceptará sin cuestionar.
 */
export function buildContext({ req }: { req: Request }) {
  // ❌ VULNERABILIDAD: Confía ciegamente en headers sin re-validar JWT
  const userId = req.headers['x-user-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;
  const userRole = req.headers['x-user-role'] as string;

  return {
    userId,
    tenantId,
    userRole,
    // ❌ NO hay validación de que estos headers sean legítimos
    // ❌ NO se verifica que el usuario realmente pertenezca al tenant
    // ❌ NO se valida la firma del JWT original
  };
}
