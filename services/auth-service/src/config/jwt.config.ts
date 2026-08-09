import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export interface JwtConfigType {
  secret: string;
  signOptions: {
    expiresIn: string;
    algorithm: string;
  };
  refreshTokenExpiresIn: string;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
      algorithm: 'HS256',
    },
  }),
);

export const refreshTokenConfig = {
  expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
};
