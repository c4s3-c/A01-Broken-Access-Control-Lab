import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  port: 5432,
  username: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'projectflow',
  password: process.env.DATABASE_URL?.split('//')[1]?.split(':')[1]?.split('@')[0] || 'ChangeMe_2026!Secure',
  database: process.env.DATABASE_URL?.split('/').pop() || 'projectflow_projects',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
