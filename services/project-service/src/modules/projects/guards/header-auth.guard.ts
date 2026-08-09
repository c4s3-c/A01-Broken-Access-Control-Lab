import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

// ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
// Este guard NO valida JWT. Confía 100% en los headers inyectados
// por el API Gateway. Si el gateway es bypaseado o los headers son
// inyectados directamente, el servicio no lo detecta.

@Injectable()
export class HeaderAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // ❌ Solo verifica que los headers EXISTAN, no su validez
    const userId = request.headers['x-user-id'];
    const tenantId = request.headers['x-tenant-id'];
    const userRole = request.headers['x-user-role'];

    if (!userId || !tenantId || !userRole) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    // Adjunta al request para uso posterior
    request.user = { id: userId, tenantId, role: userRole };
    return true;
  }
}
