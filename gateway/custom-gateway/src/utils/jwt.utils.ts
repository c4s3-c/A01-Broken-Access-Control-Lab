import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload extends JwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
}

/**
 * Valida y decodifica un token JWT
 * @param token - El token JWT a validar
 * @returns El payload del token si es válido
 * @throws Error si el token es inválido o expiró
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extrae el token Bearer del header Authorization
 * @param authHeader - El valor del header Authorization
 * @returns El token sin el prefijo "Bearer " o null si no existe
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
