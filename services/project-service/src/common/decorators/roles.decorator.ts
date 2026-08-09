import { SetMetadata } from '@nestjs/common';

// ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
// El decorador @Roles() verifica el rol del request.user,
// pero request.user viene de headers inyectados, NO de JWT validado.

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
