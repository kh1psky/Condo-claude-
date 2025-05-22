// backend/src/controllers/dashboardController.js
const { 
  Condominio, 
  Unidade, 
  Pagamento, 
  Manutencao, 
  FinanceiroAvancado,
  Contrato,
  Inventario,
  Sequelize
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Obtém dados do dashboard
 * @route GET /api/v1/dashboard
 */
exports.getDashboardData = async (req, res, next) => {
  try {
    const { condominio_id } = req.query;
    
    // Verificar se o condomínio_id foi fornecido
    if (!condominio_id) {
      return res.status(400).json({ error: 'O ID do condomínio é obrigatório' });
    }
    
    // Verificar se o condomínio existe
    const condominio = await Condominio.findByPk(condominio_id);
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Função para formatar a data conforme o dialeto do banco
    const getDateFormatFunction = () => {
      // Para MySQL
      return Sequelize.fn('DATE_FORMAT', Sequelize.col('data_vencimento'), '%Y-%m');
    };
    
    // Dados básicos do condomínio
    const dadosBasicos = {
      nome: condominio.nome,
      endereco: condominio.endereco,
      totalUnidades: await Unidade.count({ where: { condominio_id } }),
      unidadesOcupadas: await Unidade.count({ 
        where: { 
          condominio_id,
          status: 'ocupado'
        } 
      }),
    };
    
    // Métricas financeiras
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Total de pagamentos pendentes do mês
    const pagamentosPendentes = await Pagamento.sum('valor', {
      where: {
        status: 'pendente',
        data_vencimento: {
          [Op.between]: [inicioMes, fimMes]
        }
      },
      include: [{
        model: Unidade,
        as: 'unidade',
        where: { condominio_id }
      }]
    }) || 0;
    
    // Total de pagamentos recebidos no mês
    const pagamentosRecebidos = await Pagamento.sum('valor', {
      where: {
        status: 'pago',
        data_pagamento: {
          [Op.between]: [inicioMes, fimMes]
        }
      },
      include: [{
        model: Unidade,
        as: 'unidade',
        where: { condominio_id }
      }]
    }) || 0;
    
    // Total de pagamentos em atraso
    const pagamentosAtrasados = await Pagamento.sum('valor', {
      where: {
        status: 'atrasado'
      },
      include: [{
        model: Unidade,
        as: 'unidade',
        where: { condominio_id }
      }]
    }) || 0;
    
    // Despesas do mês
    const despesasMes = await FinanceiroAvancado.sum('valor', {
      where: {
        tipo: 'despesa',
        condominio_id,
        data_vencimento: {
          [Op.between]: [inicioMes, fimMes]
        }
      }
    }) || 0;
    
    // Receitas do mês
    const receitasMes = await FinanceiroAvancado.sum('valor', {
      where: {
        tipo: 'receita',
        condominio_id,
        data_vencimento: {
          [Op.between]: [inicioMes, fimMes]
        }
      }
    }) || 0;
    
    // Manutenções por status
    const manutencoesPorStatus = await Manutencao.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      where: { condominio_id },
      group: ['status']
    });
    
    // Manutenções por prioridade
    const manutencoesPorPrioridade = await Manutencao.findAll({
      attributes: [
        'prioridade',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      where: { condominio_id },
      group: ['prioridade']
    });
    
    // Contratos prestes a vencer (próximos 30 dias)
    const hoje30 = new Date();
    hoje30.setDate(hoje30.getDate() + 30);
    
    const contratosPrestesVencer = await Contrato.count({
      where: {
        condominio_id,
        data_fim: {
          [Op.between]: [hoje, hoje30]
        },
        status: 'vigente'
      }
    });
    
    // Itens com estoque baixo
    const itensBaixoEstoque = await Inventario.count({
      where: {
        condominio_id,
        quantidade: {
          [Op.lt]: Sequelize.col('estoque_minimo')
        },
        estoque_minimo: {
          [Op.gt]: 0
        }
      }
    });
    
    // Últimas 5 manutenções
    const ultimasManutencoes = await Manutencao.findAll({
      where: { condominio_id },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [
        {
          model: Usuario,
          as: 'solicitante',
          attributes: ['id', 'nome']
        }
      ]
    });
    
    // Dados para gráfico de receitas x despesas dos últimos 6 meses
    const ultimos6Meses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      ultimos6Meses.push({
        mes: d.toLocaleString('default', { month: 'short' }),
        ano: d.getFullYear(),
        mesAno: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      });
    }
    
    // Receitas por mês (últimos 6 meses)
    const receitasPorMes = await FinanceiroAvancado.findAll({
      attributes: [
        [getDateFormatFunction(), 'mes'],
        [Sequelize.fn('SUM', Sequelize.col('valor')), 'total']
      ],
      where: {
        condominio_id,
        tipo: 'receita',
        data_vencimento: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 5))
        }
      },
      group: [getDateFormatFunction()]
    });
    
    // Despesas por mês (últimos 6 meses)
    const despesasPorMes = await FinanceiroAvancado.findAll({
      attributes: [
        [getDateFormatFunction(), 'mes'],
        [Sequelize.fn('SUM', Sequelize.col('valor')), 'total']
      ],
      where: {
        condominio_id,
        tipo: 'despesa',
        data_vencimento: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 5))
        }
      },
      group: [getDateFormatFunction()]
    });
    
    // Formatar dados para o gráfico
    const dadosGrafico = ultimos6Meses.map(mes => {
      const receita = receitasPorMes.find(r => r.dataValues.mes === mes.mesAno);
      const despesa = despesasPorMes.find(d => d.dataValues.mes === mes.mesAno);
      
      return {
        mes: `${mes.mes}/${mes.ano}`,
        receitas: receita ? parseFloat(receita.dataValues.total) : 0,
        despesas: despesa ? parseFloat(despesa.dataValues.total) : 0
      };
    });
    
    // Consolidar todos os dados do dashboard
    const dashboardData = {
      dadosBasicos,
      metricas: {
        pagamentosPendentes,
        pagamentosRecebidos,
        pagamentosAtrasados,
        despesasMes,
        receitasMes,
        contratosPrestesVencer,
        itensBaixoEstoque
      },
      estatisticas: {
        manutencoesPorStatus,
        manutencoesPorPrioridade
      },
      ultimasManutencoes,
      graficoReceitasDespesas: dadosGrafico
    };
    
    return res.json(dashboardData);
  } catch (error) {
    logger.error('Erro ao obter dados do dashboard:', error);
    next(error);
  }
};
