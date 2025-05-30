// backend/src/config/env.js
require('dotenv').config();

module.exports = {
  // Node / Express
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3001,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || 'password',
  DB_NAME: process.env.DB_NAME || 'condominios_db',
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  
  // Backups
  BACKUP_DIR: process.env.BACKUP_DIR || './backups',
  BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 7,
  
  // Paths
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads'
};