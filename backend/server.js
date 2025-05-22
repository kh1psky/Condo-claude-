// backend/server.js
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const db = require('./src/models');
const redisClient = require('./src/config/redis');
const scheduler = require('./src/utils/scheduler');

// Função para inicializar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco de dados
    await db.sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Testar conexão com o Redis
    await redisClient.ping();
    logger.info('Conexão com o Redis estabelecida com sucesso.');
    
    // Iniciar as tarefas agendadas
    scheduler.startAllTasks();
    logger.info('Tarefas agendadas iniciadas com sucesso.');
    
    // Iniciar o servidor
    const server = app.listen(env.PORT, () => {
      logger.info(`Servidor rodando na porta ${env.PORT} em modo ${env.NODE_ENV}`);
      logger.info(`Documentação da API disponível em http://localhost:${env.PORT}/api-docs`);
    });
    
    // Tratamento de encerramento gracioso
    const gracefulShutdown = async (signal) => {
      logger.info(`Recebido sinal ${signal}. Iniciando encerramento gracioso...`);
      
      // Parar as tarefas agendadas
      scheduler.stopAllTasks();
      logger.info('Tarefas agendadas paradas.');
      
      // Fechar conexão com Redis
      redisClient.disconnect();
      logger.info('Conexão com Redis fechada.');
      
      // Fechar servidor HTTP
      server.close(() => {
        logger.info('Servidor HTTP fechado.');
        
        // Fechar conexão com banco de dados
        db.sequelize.close().then(() => {
          logger.info('Conexão com banco de dados fechada.');
          process.exit(0);
        });
      });
    };
    
    // Capturar sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Iniciar o servidor
startServer();
