import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { buildContext } from './middleware/context.middleware';
import { healthController } from './health/health.controller';
import { AppDataSource } from './config/env';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

async function startServer() {
  // Inicializar conexión a base de datos
  await AppDataSource.initialize();
  logger.info('✅ Database connected');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // ⚠️ VULNERABILIDAD INTENCIONAL - FALLA 1
  // Introspection y Playground habilitados en "producción"
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,  // ❌ Habilitada - permite descubrir todo el schema
    playground: true,     // ❌ Habilitado - IDE accesible públicamente
    // ❌ Sin plugins de depth limiting ni complexity analysis
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: buildContext,
    })
  );

  // Health check endpoint
  app.get('/health', healthController);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`🚀 GraphQL API running on http://localhost:${PORT}/graphql`);
    logger.warn('⚠️  WARNING: Introspection and Playground are ENABLED (vulnerability for lab)');
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
