import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que extrae el contexto del tenant de los headers inyectados
 * y lo adjunta al request para uso posterior.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    if (tenantId) {
      // Adjuntar contexto del tenant al request
      (req as any).tenantContext = {
        tenantId,
        userId,
        userRole,
        timestamp: new Date().toISOString(),
      };
      
      this.logger.debug(`Tenant context: ${tenantId} for user ${userId}`);
    }

    next();
  }
}
