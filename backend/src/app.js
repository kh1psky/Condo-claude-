const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const swaggerConfig = require('./config/swaggerConfig');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const condominioRoutes = require('./routes/condominioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const relatoriosRoutes = require('./routes/relatoriosRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const unidadeRoutes = require('./routes/unidadeRoutes');
const manutencaoRoutes = require('./routes/manutencaoRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const contratoRoutes = require('./routes/contratoRoutes');

const app = express();

// ===== MIDDLEWARES DE SEGURANÇA =====
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ===== MIDDLEWARES GERAIS =====
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use('/api', limiter);

// ===== DOCUMENTAÇÃO SWAGGER =====
swaggerConfig(app);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ===== ROTAS DA API =====
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/condominios', condominioRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/relatorios', relatoriosRoutes);
app.use('/api/v1/pagamentos', pagamentoRoutes);
app.use('/api/v1/documentos', documentoRoutes);
app.use('/api/v1/unidades', unidadeRoutes);
app.use('/api/v1/manutencoes', manutencaoRoutes);
app.use('/api/v1/fornecedores', fornecedorRoutes);
app.use('/api/v1/contratos', contratoRoutes);

// ===== MIDDLEWARE DE ERRO =====
app.use(errorHandler);

// ===== ROTA 404 =====
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

module.exports = app;
