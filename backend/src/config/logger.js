// backend/src/config/logger.js
const winston = require('winston');
const { format, transports } = winston;
require('winston-daily-rotate-file');
const env = require('./env');

// Define o formato padrão dos logs
const defaultFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Cria um transporte rotativo de arquivos para cada dia
const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

// Configura o logger
const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: defaultFormat,
  defaultMeta: { service: 'condominios-api' },
  transports: [
    // Log em arquivo rotativo para todos os níveis
    dailyRotateFileTransport,
    // Log de erros separado
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Adiciona console transport se não for produção
if (env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(info => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      })
    )
  }));
}

module.exports = logger;