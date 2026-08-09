import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload, Tokens, AuthResponse } from './interfaces/jwt-payload.interface';
import { redisConfig } from '../../config/redis.config';

@Injectable()
export class AuthService {
  private redisClient: Redis;
  private readonly refreshTokenExpiresIn: string;
  private readonly maxLoginAttempts: number;
  private readonly blockDuration: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const redisConf = redisConfig();
    this.redisClient = new Redis({
      host: redisConf.host,
      port: redisConf.port,
      password: redisConf.password,
      db: redisConf.db,
      retryStrategy: () => null,
    });

    this.refreshTokenExpiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION', '7d');
    this.maxLoginAttempts = parseInt(this.configService.get<string>('RATE_LIMIT_MAX_ATTEMPTS', '5'), 10);
    this.blockDuration = parseInt(this.configService.get<string>('RATE_LIMIT_BLOCK_DURATION', '15'), 10);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName, tenantId } = registerDto;

    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email, tenant: { id: tenantId } },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists in this tenant');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      tenant,
      role: 'MEMBER',
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const lockKey = `login_lock:${email.toLowerCase()}`;
    const isLocked = await this.redisClient.get(lockKey);

    if (isLocked) {
      const ttl = await this.redisClient.ttl(lockKey);
      throw new UnauthorizedException(
        `Account temporarily locked. Try again in ${Math.ceil(ttl / 60)} minutes`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['tenant'],
    });

    if (!user || !user.isActive) {
      await this.incrementFailedAttempts(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.incrementFailedAttempts(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<{ tokens: Tokens }> {
    const { refreshToken } = refreshTokenDto;

    const userId = await this.redisClient.get(`refresh_token:${refreshToken}`);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user || !user.isActive) {
      await this.redisClient.del(`refresh_token:${refreshToken}`);
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.redisClient.del(`refresh_token:${refreshToken}`);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { tokens };
  }

  async logout(accessToken: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken);
      const userId = payload.sub;

      const keys = await this.redisClient.keys(`refresh_token:*`);
      
      for (const key of keys) {
        const storedUserId = await this.redisClient.get(key);
        if (storedUserId === userId) {
          await this.redisClient.del(key);
          break;
        }
      }

      return { message: 'Logged out successfully' };
    } catch {
      return { message: 'Logged out successfully' };
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapUserToResponse(user);
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${refreshToken}`;
    const expiresInSeconds = this.parseExpirationToSeconds(this.refreshTokenExpiresIn);
    
    await this.redisClient.setex(key, expiresInSeconds, userId);
  }

  private async incrementFailedAttempts(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) return;

    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.maxLoginAttempts) {
      user.lockedUntil = new Date(Date.now() + this.blockDuration * 60 * 1000);
      await this.userRepository.save(user);

      const lockKey = `login_lock:${email.toLowerCase()}`;
      await this.redisClient.setex(lockKey, this.blockDuration * 60, 'locked');
    } else {
      await this.userRepository.save(user);
    }
  }

  private mapUserToResponse(user: User): {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  } {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenant.id,
    };
  }

  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 604800;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 604800;
    }
  }
}
