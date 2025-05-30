// backend/src/config/redis.js
const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

const redisClient = new Redis(redisConfig);

// Eventos
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', err);
});

module.exports = redisClient;