import express, { Request, Response } from 'express';
import proxyRoutes from './routes/proxy.routes';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { logger } from './middleware/logger.middleware';
import { config } from './config/env';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Aplicar rate limiting global (excluye /health)
app.use(rateLimiter);

// Health check endpoint - NO requiere auth ni rate limiting
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de proxy hacia microservicios
app.use(proxyRoutes);

// Manejo de rutas no encontradas (404)
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  res.status(404).json({ error: 'Not Found' });
});

// Manejo global de errores
app.use((err: Error, req: Request, res: Response, next: unknown): void => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
  logger.info('API Gateway started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
  console.log(`API Gateway running on port ${PORT}`);
});

export default app;
