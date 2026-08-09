import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractBearerToken, JWTPayload } from '../utils/jwt.utils';
import { logger } from './logger.middleware';

/**
 * Middleware de autenticación JWT
 * 
 * Valida el token JWT y extrae los claims para inyectarlos como headers
 * hacia los microservicios downstream.
 * 
 * ⚠️ VULNERABILIDAD INTENCIONAL - OWASP A01:2025
 * Este middleware PROPAGA headers x-* existentes del request original
 * sin sanitizar, permitiendo que un atacante sobrescriba los claims
 * verificados del JWT con valores maliciosos.
 * 
 * ESTO ES DELIBERADO PARA EL LABORATORIO DE SEGURIDAD - NO CORREGIR
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    logger.warn('Unauthorized access attempt - missing token', {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload: JWTPayload = verifyToken(token);

    // Headers que se inyectarán desde los claims del JWT verificado
    const proxyHeaders: Record<string, string> = {
      'x-user-id': payload.sub,
      'x-user-email': payload.email,
      'x-tenant-id': payload.tenant_id,
      'x-user-role': payload.role,
    };

    // ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
    // Propaga headers x-* existentes del request original
    // Esto permite Header Injection: un atacante puede enviar headers falsos
    // que sobrescriban los claims verificados del JWT
    const existingHeaders = ['x-user-id', 'x-user-email', 'x-tenant-id', 'x-user-role'];
    existingHeaders.forEach((header) => {
      if (req.headers[header]) {
        // Sobrescribe con el valor del cliente en lugar del JWT verificado
        proxyHeaders[header] = req.headers[header] as string;
        logger.warn('Vulnerability triggered: Client header overrode JWT claim', {
          header,
          clientValue: req.headers[header],
          jwtValue: header === 'x-user-id' ? payload.sub :
                    header === 'x-user-email' ? payload.email :
                    header === 'x-tenant-id' ? payload.tenant_id :
                    payload.role,
          url: req.url,
          ip: req.ip,
        });
      }
    });

    // Inyectar headers en el request para el proxy
    Object.entries(proxyHeaders).forEach(([key, value]) => {
      req.headers[key] = value;
    });

    logger.debug('JWT validated and headers injected', {
      userId: payload.sub,
      tenantId: payload.tenant_id,
      role: payload.role,
      url: req.url,
    });

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    logger.warn('JWT validation failed', {
      error: errorMessage,
      url: req.url,
      ip: req.ip,
    });
    res.status(401).json({ error: 'Unauthorized' });
  }
}
