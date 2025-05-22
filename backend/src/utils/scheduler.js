// backend/src/utils/scheduler.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const logger = require('../config/logger');
const backup = require('./backup');
const { 
  Pagamento,
  Contrato,
  Notificacao,
  Manutencao,
  FinanceiroAvancado,
  Inventario,
  Unidade,
  Usuario
} = require('../models');

class Scheduler {
  constructor() {
    this.tasks = {};
  }
  
  /**
   * Inicia todas as tarefas agendadas
   */
  startAllTasks() {
    logger.info('Iniciando todas as tarefas agendadas');
    
    // Backup diário às 2h da manhã
    this.tasks.dailyBackup = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Executando backup diário');
        await backup.createBackup();
        await backup.cleanOldBackups();
      } catch (error) {
        logger.error('Erro ao executar backup diário:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Verificação diária de pagamentos vencidos às 5h da manhã
    this.tasks.checkOverduePayments = cron.schedule('0 5 * * *', async () => {
      try {
        logger.info('Verificando pagamentos vencidos');
        await this.checkOverduePayments();
      } catch (error) {
        logger.error('Erro ao verificar pagamentos vencidos:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Verificação semanal de contratos prestes a vencer (domingo às 7h)
    this.tasks.checkExpiringContracts = cron.schedule('0 7 * * 0', async () => {
      try {
        logger.info('Verificando contratos prestes a vencer');
        await this.checkExpiringContracts();
      } catch (error) {
        logger.error('Erro ao verificar contratos prestes a vencer:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Verificação semanal de estoque baixo (segunda-feira às 8h)
    this.tasks.checkLowInventory = cron.schedule('0 8 * * 1', async () => {
      try {
        logger.info('Verificando itens com estoque baixo');
        await this.checkLowInventory();
      } catch (error) {
        logger.error('Erro ao verificar itens com estoque baixo:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    // Atualização mensal do status de pagamentos (dia 1 às 1h da manhã)
    this.tasks.updatePaymentStatus = cron.schedule('0 1 1 * *', async () => {
      try {
        logger.info('Atualizando status de pagamentos mensais');
        await this.updatePaymentStatus();
      } catch (error) {
        logger.error('Erro ao atualizar status de pagamentos mensais:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/Sao_Paulo'
    });
    
    logger.info('Todas as tarefas agendadas foram iniciadas');
  }
  
  /**
   * Para todas as tarefas agendadas
   */
  stopAllTasks() {
    logger.info('Parando todas as tarefas agendadas');
    
    Object.values(this.tasks).forEach(task => {
      if (task && typeof task.stop === 'function') {
        task.stop();
      }
    });
    
    logger.info('Todas as tarefas agendadas foram paradas');
  }
  
  /**
   * Verifica pagamentos vencidos e cria notificações
   */
  async checkOverduePayments() {
    try {
      const today = new Date();
      
      // Busca pagamentos que venceram ontem e estão pendentes
      const yesterdayDate = new Date(today);
      yesterdayDate.setDate(today.getDate() - 1);
      
      const overduePayments = await Pagamento.findAll({
        where: {
          data_vencimento: yesterdayDate,
          status: 'pendente'
        },
        include: [{
          model: Unidade,
          as: 'unidade',
          include: [{
            model: Usuario,
            as: 'proprietario'
          }]
        }]
      });
      
      logger.info(`Encontrados ${overduePayments.length} pagamentos vencidos`);
      
      // Atualiza status para 'atrasado'
      for (const payment of overduePayments) {
        await payment.update({ status: 'atrasado' });
        
        // Cria notificação para o proprietário
        if (payment.unidade && payment.unidade.proprietario) {
          await Notificacao.create({
            titulo: 'Pagamento em atraso',
            mensagem: `O pagamento ${payment.descricao} no valor de R$ ${payment.valor} venceu ontem e não foi registrado como pago.`,
            tipo: 'aviso',
            usuario_id: payment.unidade.proprietario.id,
            unidade_id: payment.unidade.id,
            status: 'enviada'
          });
        }
      }
      
      // Busca pagamentos atrasados há mais de 5 dias
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);
      
      const criticalOverduePayments = await Pagamento.findAll({
        where: {
          data_vencimento: {
            [Op.lt]: fiveDaysAgo
          },
          status: 'atrasado'
        },
        include: [{
          model: Unidade,
          as: 'unidade',
          include: [{
            model: Usuario,
            as: 'proprietario'
          }]
        }]
      });
      
      logger.info(`Encontrados ${criticalOverduePayments.length} pagamentos em atraso crítico`);
      
      // Cria notificações urgentes
      for (const payment of criticalOverduePayments) {
        if (payment.unidade && payment.unidade.proprietario) {
          // Verifica se já existe uma notificação recente para este pagamento
          const existingNotification = await Notificacao.findOne({
            where: {
              titulo: 'Pagamento em atraso crítico',
              usuario_id: payment.unidade.proprietario.id,
              created_at: {
                [Op.gt]: new Date(today.setDate(today.getDate() - 7))
              },
              mensagem: {
                [Op.like]: `%${payment.descricao}%`
              }
            }
          });
          
          if (!existingNotification) {
            await Notificacao.create({
              titulo: 'Pagamento em atraso crítico',
              mensagem: `O pagamento ${payment.descricao} no valor de R$ ${payment.valor} está em atraso há mais de 5 dias. Por favor, regularize o quanto antes para evitar multas adicionais.`,
              tipo: 'urgente',
              usuario_id: payment.unidade.proprietario.id,
              unidade_id: payment.unidade.id,
              status: 'enviada'
            });
          }
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar pagamentos vencidos:', error);
      throw error;
    }
  }
  
  /**
   * Verifica contratos prestes a vencer e cria notificações
   */
  async checkExpiringContracts() {
    try {
      const today = new Date();
      
      // Busca contratos que vencem nos próximos 30 dias
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const expiringContracts = await Contrato.findAll({
        where: {
          data_fim: {
            [Op.between]: [today, thirtyDaysLater]
          },
          status: 'vigente'
        },
        include: [{
          model: Condominio,
          as: 'condominio'
        }, {
          model: Fornecedor,
          as: 'fornecedor'
        }]
      });
      
      logger.info(`Encontrados ${expiringContracts.length} contratos prestes a vencer`);
      
      // Busca administradores para notificar
      const admins = await Usuario.findAll({
        where: {
          tipo: {
            [Op.in]: ['admin', 'sindico']
          },
          status: 'ativo'
        }
      });
      
      // Cria notificações
      for (const contract of expiringContracts) {
        for (const admin of admins) {
          // Calcula dias restantes
          const daysLeft = Math.ceil((contract.data_fim - today) / (1000 * 60 * 60 * 24));
          
          await Notificacao.create({
            titulo: 'Contrato prestes a vencer',
            mensagem: `O contrato ${contract.numero} com ${contract.fornecedor.nome} referente a "${contract.objeto}" vence em ${daysLeft} dias (${contract.data_fim.toLocaleDateString('pt-BR')}).`,
            tipo: daysLeft <= 7 ? 'urgente' : 'aviso',
            usuario_id: admin.id,
            status: 'enviada'
          });
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar contratos prestes a vencer:', error);
      throw error;
    }
  }
  
  /**
   * Verifica itens com estoque baixo e cria notificações
   */
  async checkLowInventory() {
    try {
      // Busca itens com estoque abaixo do mínimo
      const lowInventoryItems = await Inventario.findAll({
        where: {
          quantidade: {
            [Op.lt]: Sequelize.col('estoque_minimo')
          },
          estoque_minimo: {
            [Op.gt]: 0
          },
          status: 'disponivel'
        },
        include: [{
          model: Condominio,
          as: 'condominio'
        }]
      });
      
      logger.info(`Encontrados ${lowInventoryItems.length} itens com estoque baixo`);
      
      // Busca administradores para notificar
      const admins = await Usuario.findAll({
        where: {
          tipo: {
            [Op.in]: ['admin', 'sindico']
          },
          status: 'ativo'
        }
      });
      
      // Cria notificações
      for (const item of lowInventoryItems) {
        for (const admin of admins) {
          await Notificacao.create({
            titulo: 'Estoque baixo',
            mensagem: `O item "${item.nome}" está com estoque baixo. Atual: ${item.quantidade}, Mínimo: ${item.estoque_minimo}. Condomínio: ${item.condominio.nome}.`,
            tipo: 'aviso',
            usuario_id: admin.id,
            status: 'enviada'
          });
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar itens com estoque baixo:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza status de pagamentos mensais
   */
  async updatePaymentStatus() {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentYear = today.getFullYear();
      
      // Busca todos os condomínios ativos
      const condominios = await Condominio.findAll({
        where: {
          status: 'ativo'
        }
      });
      
      logger.info(`Processando criação de pagamentos mensais para ${condominios.length} condomínios`);
      
      for (const condominio of condominios) {
        // Busca todas as unidades do condomínio
        const unidades = await Unidade.findAll({
          where: {
            condominio_id: condominio.id
          }
        });
        
        // Para cada unidade, cria o pagamento de condomínio do mês atual
        for (const unidade of unidades) {
          // Verifica se já existe um pagamento para este mês/ano
          const existingPayment = await Pagamento.findOne({
            where: {
              unidade_id: unidade.id,
              tipo: 'condominio',
              referencia_mes: currentMonth,
              referencia_ano: currentYear
            }
          });
          
          // Se não existir, cria o pagamento
          if (!existingPayment && unidade.valor_base_condominio) {
            // Define vencimento para o dia 10 do mês atual
            const vencimento = new Date(currentYear, currentMonth - 1, 10);
            
            await Pagamento.create({
              unidade_id: unidade.id,
              tipo: 'condominio',
              descricao: `Condomínio ${unidade.numero} - ${currentMonth}/${currentYear}`,
              valor: unidade.valor_base_condominio,
              data_vencimento: vencimento,
              status: 'pendente',
              referencia_mes: currentMonth,
              referencia_ano: currentYear
            });
          }
        }
      }
      
      logger.info('Processamento de pagamentos mensais concluído');
      
    } catch (error) {
      logger.error('Erro ao atualizar status de pagamentos mensais:', error);
      throw error;
    }
  }
}

module.exports = new Scheduler();