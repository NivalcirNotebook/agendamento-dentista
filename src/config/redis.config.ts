import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD || undefined,
        db: env.REDIS_DB,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      RedisClient.instance.on('connect', () => {
        logger.info('✅ Redis conectado com sucesso');
      });

      RedisClient.instance.on('error', (error) => {
        logger.error('❌ Erro no Redis:', error);
      });

      RedisClient.instance.on('reconnecting', () => {
        logger.warn('🔄 Reconectando ao Redis...');
      });
    }

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      logger.info('Redis desconectado');
    }
  }
}

export const redis = RedisClient.getInstance();
