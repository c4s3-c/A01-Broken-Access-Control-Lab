import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  getClient(): Redis {
    if (!this.redisClient) {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
      });
    }
    return this.redisClient;
  }
}
