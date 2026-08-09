import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, printf, json } = winston.format;

/**
 * Formato personalizado para logs estructurados en JSON
 * Incluye todos los campos relevantes para auditoría de seguridad
 */
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...metadata,
  });
});

/**
 * Logger estructurado para el API Gateway
 * Nivel configurable via variable de entorno LOG_LEVEL
 */
export const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(timestamp({ format: 'ISO8601' }), json()),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    new winston.transports.Console({
      format: combine(timestamp({ format: 'ISO8601' }), json()),
    }),
  ],
});
