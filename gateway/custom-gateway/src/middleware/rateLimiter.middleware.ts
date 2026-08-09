import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/env';
import { logger } from './logger.middleware';

/**
 * Middleware de Rate Limiting para prevenir abusos
 * 
 * Configuración:
 * - Ventana: RATE_LIMIT_WINDOW ms (default: 60000 = 1 minuto)
 * - Máximo: RATE_LIMIT_MAX requests por IP (default: 100)
 * 
 * Excluye la ruta /health del rate limiting para permitir monitoreo
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({ error: 'Too many requests' });
  },
  skip: (req: Request): boolean => {
    // Excluir health check del rate limiting
    return req.url === '/health';
  },
});
