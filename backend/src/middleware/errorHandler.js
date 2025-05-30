// backend/src/middleware/errorHandler.js
const logger = require('../config/logger');

// Formatador de erro para retorno ao cliente
const formatError = (err) => {
  // Se for um erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação nos dados',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    };
  }

  // Se for um erro de chave única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return {
      code: 'UNIQUE_CONSTRAINT_ERROR',
      message: 'Dados duplicados detectados',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    };
  }

  // Se for um erro de validação do express-validator
  if (err.array && typeof err.array === 'function') {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação nos dados',
      details: err.array().map(e => ({
        field: e.param,
        message: e.msg
      }))
    };
  }

  // Erro genérico
  return {
    code: 'INTERNAL_ERROR',
    message: err.message || 'Ocorreu um erro interno no servidor'
  };
};

// Middleware para tratamento de erros
module.exports = (err, req, res, next) => {
  // Log do erro
  logger.error('Erro capturado no middleware de erro:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.usuario ? req.usuario.id : null
  });

  // Formato padronizado para todos os erros
  const formattedError = formatError(err);
  
  // Define o status HTTP adequado
  let statusCode = 500;
  
  if (formattedError.code === 'VALIDATION_ERROR') {
    statusCode = 400;
  } else if (formattedError.code === 'UNIQUE_CONSTRAINT_ERROR') {
    statusCode = 409;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Responde com o erro formatado
  return res.status(statusCode).json({ error: formattedError });
};