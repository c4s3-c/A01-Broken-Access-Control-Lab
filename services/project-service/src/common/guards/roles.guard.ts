import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
// Este guard verifica roles contra request.user.role, pero request.user
// viene de headers inyectados por HeaderAuthGuard. NO hay validación contra BD.

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;

    // ❌ Compara el rol del header (inyectado) con los roles requeridos
    // Si el atacante inyectó x-user-role: ADMIN, esto pasa
    return requiredRoles.some((role) => role === userRole);
  }
}
