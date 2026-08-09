import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * ⚠️ VULNERABILIDAD INTENCIONAL - NO CORREGIR
 * 
 * Este guard NO valida JWT. Confía 100% en los headers inyectados
 * por el API Gateway. Si el gateway es bypaseado o los headers son
 * inyectados directamente, el servicio no lo detecta.
 * 
 * Esto conecta con la FALLA 3 del laboratorio (Header Injection en API Gateway).
 */
@Injectable()
export class HeaderAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // ❌ VULNERABILIDAD: Solo verifica que los headers EXISTAN, no su validez
    // No hay validación de firma JWT, no hay verificación contra Auth Service
    const userId = request.headers['x-user-id'];
    const tenantId = request.headers['x-tenant-id'];
    const userRole = request.headers['x-user-role'];

    if (!userId || !tenantId || !userRole) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    // Adjunta al request para uso posterior
    // ⚠️ Estos valores vienen directamente del cliente si el Gateway fue bypassed
    request.user = { 
      id: userId, 
      tenantId, 
      role: userRole 
    };

    return true;
  }
}
