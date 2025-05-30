// backend/src/routes/index.js
const express = require('express');
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const condominioRoutes = require('./condominioRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const relatoriosRoutes = require('./relatoriosRoutes');
const pagamentoRoutes = require('./pagamentoRoutes');
// importar outras rotas conforme implementação

const router = express.Router();

// Rotas públicas (não requerem autenticação)
router.get('/', (req, res) => {
  res.json({
    message: 'API de Gerenciamento de Condomínios',
    version: '1.0.0',
    status: 'online',
    documentation: '/api-docs'
  });
});

// Rotas da API v1
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/condominios', condominioRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/pagamentos', pagamentoRoutes);
// adicionar outras rotas conforme implementação

module.exports = router;