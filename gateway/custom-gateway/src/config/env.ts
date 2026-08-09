import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-2026',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'debug',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3004',
    users: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    projects: process.env.PROJECT_SERVICE_URL || 'http://project-service:3002',
    graphql: process.env.GRAPHQL_SERVICE_URL || 'http://graphql-api:4000',
  },
};
