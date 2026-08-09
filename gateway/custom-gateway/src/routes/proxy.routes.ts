import { Router, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { config } from '../config/env';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '../middleware/logger.middleware';

const router = Router();

/**
 * Opciones comunes para el proxy
 * Timeout de 30 segundos y logging de errores
 */
const proxyOptions = {
  timeout: 30000,
  onError: (err: Error, req: Request, res: Response): void => {
    logger.error('Proxy error', {
      error: err.message,
      url: req.url,
      method: req.method,
    });
    res.status(502).json({ error: 'Bad Gateway', message: 'Service unavailable' });
  },
};

/**
 * Proxy para Auth Service
 * Rutas: /auth/*
 * NO requiere autenticación (el login/registro son públicos)
 */
router.use(
  '/auth',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    ...proxyOptions,
  })
);

/**
 * Proxy para User Service
 * Rutas: /api/users/*
 * SÍ requiere autenticación
 */
router.use(
  '/api/users',
  authMiddleware,
  createProxyMiddleware({
    target: config.services.users,
    changeOrigin: true,
    ...proxyOptions,
  })
);

/**
 * Proxy para Project Service
 * Rutas: /api/projects/*
 * SÍ requiere autenticación
 */
router.use(
  '/api/projects',
  authMiddleware,
  createProxyMiddleware({
    target: config.services.projects,
    changeOrigin: true,
    ...proxyOptions,
  })
);

/**
 * Proxy para GraphQL API
 * Ruta: /graphql
 * SÍ requiere autenticación
 */
router.use(
  '/graphql',
  authMiddleware,
  createProxyMiddleware({
    target: config.services.graphql,
    changeOrigin: true,
    ...proxyOptions,
  })
);

export default router;
