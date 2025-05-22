// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const env = require('../config/env');
const logger = require('../config/logger');

// Middleware para autenticar o usuário via JWT
exports.authMiddleware = async (req, res, next) => {
  try {
    // Verifica se o Authorization header existe
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Extrai o token do header (Bearer TOKEN)
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Erro no formato do token' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token malformatado' });
    }

    // Verifica se o token é válido
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const usuario = await Usuario.findByPk(decoded.id);

      // Verifica se o usuário ainda existe e está ativo
      if (!usuario || usuario.status !== 'ativo') {
        return res.status(401).json({ error: 'Usuário inválido ou inativo' });
      }

      // Adiciona o usuário ao request para uso nas rotas
      req.usuario = usuario;
      return next();
    } catch (err) {
      logger.error('Erro na autenticação: ', err);
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    logger.error('Erro no middleware de autenticação: ', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar se o usuário é admin
exports.isAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso restrito a administradores' });
};

// Middleware para verificar se o usuário é admin ou síndico
exports.isAdminOrSindico = (req, res, next) => {
  if (req.usuario && (req.usuario.tipo === 'admin' || req.usuario.tipo === 'sindico')) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso restrito a administradores ou síndicos' });
};

// Middleware para verificar se o usuário é dono do recurso ou admin
exports.isOwnerOrAdmin = (paramIdField) => {
  return (req, res, next) => {
    const resourceId = req.params[paramIdField];
    if (
      req.usuario && 
      (req.usuario.tipo === 'admin' || 
       req.usuario.id === parseInt(resourceId, 10))
    ) {
      return next();
    }
    return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso' });
  };
};