// backend/src/middleware/rateLimiter.js
const redis = require('../config/redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const logger = require('../config/logger');

// Configuração base para o limitador de taxa
const rateLimiterOpts = {
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: 50, // Número de pontos (requisições)
  duration: 60, // Por janela de tempo (segundos)
  blockDuration: 60 * 10 // Tempo de bloqueio após exceder limite (segundos)
};

// Instancia o limitador de taxa com Redis
const rateLimiter = new RateLimiterRedis(rateLimiterOpts);

// Cria um limitador mais rigoroso para endpoints sensíveis (login, registro)
const sensitiveRateLimiterOpts = {
  ...rateLimiterOpts,
  keyPrefix: 'ratelimit_sensitive',
  points: 5, // Menos requisições permitidas
  duration: 60, // Na mesma janela de tempo
  blockDuration: 60 * 15 // Bloqueio mais longo
};

const sensitiveRateLimiter = new RateLimiterRedis(sensitiveRateLimiterOpts);

// Middleware padrão para limitar a taxa de requisições
exports.rateLimiterMiddleware = async (req, res, next) => {
  // IP como identificador (pode ser melhorado com combinação de outros fatores)
  const key = req.ip;
  
  try {
    await rateLimiter.consume(key);
    next();
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Erro no rate limiter:', err);
      next(err);
    } else {
      // Foi rejeitado por exceder o limite
      logger.warn(`Rate limit excedido para IP: ${key}`);
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
          retryAfter: Math.round(err.msBeforeNext / 1000) || 60
        }
      });
    }
  }
};

// Middleware para limitar endpoints sensíveis
exports.sensitiveRateLimiterMiddleware = async (req, res, next) => {
  const key = req.ip;
  
  try {
    await sensitiveRateLimiter.consume(key);
    next();
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Erro no rate limiter para endpoint sensível:', err);
      next(err);
    } else {
      logger.warn(`Rate limit sensível excedido para IP: ${key}`);
      res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas tentativas. Por favor, tente novamente mais tarde.',
          retryAfter: Math.round(err.msBeforeNext / 1000) || 60 * 15
        }
      });
    }
  }
};