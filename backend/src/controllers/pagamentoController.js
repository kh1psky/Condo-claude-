// backend/src/controllers/pagamentoController.js
const { Pagamento, Unidade, Usuario } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Lista pagamentos com filtros e paginação
 * @route GET /api/v1/pagamentos
 */
exports.listarPagamentos = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 10,
      unidade_id,
      status,
      tipo,
      data_inicio,
      data_fim,
      condominio_id
    } = req.query;
    
    // Opções de consulta
    const options = {
      order: [['data_vencimento', 'DESC']],
      where: {},
      include: [{
        model: Unidade,
        as: 'unidade',
        include: [{
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email']
        }]
      }]
    };
    
    // Aplicar filtros
    if (unidade_id) {
      options.where.unidade_id = unidade_id;
    }
    
    if (status) {
      options.where.status = status;
    }
    
    if (tipo) {
      options.where.tipo = tipo;
    }
    
    // Filtro por período de vencimento
    if (data_inicio || data_fim) {
      options.where.data_vencimento = {};
      
      if (data_inicio) {
        options.where.data_vencimento[Op.gte] = new Date(data_inicio);
      }
      
      if (data_fim) {
        options.where.data_vencimento[Op.lte] = new Date(data_fim);
      }
    }
    
    // Filtro por condomínio (via relação com unidade)
    if (condominio_id) {
      if (!options.include[0].where) {
        options.include[0].where = {};
      }
      
      options.include[0].where.condominio_id = condominio_id;
    }
    
    // Aplicar paginação
    const { rows: pagamentos, count } = await Pagamento.findAndCountAll({
      ...options,
      offset: (parseInt(pagina, 10) - 1) * parseInt(limite, 10),
      limit: parseInt(limite, 10)
    });
    
    return res.json({
      pagamentos,
      meta: {
        total: count,
        pagina: parseInt(pagina, 10),
        limite: parseInt(limite, 10),
        paginas: Math.ceil(count / parseInt(limite, 10))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar pagamentos:', error);
    next(error);
  }
};

/**
 * Busca um pagamento pelo ID
 * @route GET /api/v1/pagamentos/:id
 */
exports.buscarPagamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pagamento = await Pagamento.findByPk(id, {
      include: [{
        model: Unidade,
        as: 'unidade',
        include: [{
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email']
        }]
      }]
    });
    
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    return res.json(pagamento);
  } catch (error) {
    logger.error(`Erro ao buscar pagamento ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Cria um novo pagamento
 * @route POST /api/v1/pagamentos
 */
exports.criarPagamento = async (req, res, next) => {
  try {
    const {
      unidade_id,
      tipo,
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      status,
      referencia_mes,
      referencia_ano
    } = req.body;
    
    // Verificar se a unidade existe
    const unidade = await Unidade.findByPk(unidade_id);
    if (!unidade) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }
    
    // Criar o pagamento
    const pagamento = await Pagamento.create({
      unidade_id,
      tipo: tipo || 'condominio',
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      status: status || 'pendente',
      referencia_mes,
      referencia_ano
    });
    
    logger.info(`Pagamento criado: ${pagamento.id}`);
    
    return res.status(201).json({
      message: 'Pagamento criado com sucesso',
      pagamento
    });
  } catch (error) {
    logger.error('Erro ao criar pagamento:', error);
    next(error);
  }
};

/**
 * Atualiza um pagamento
 * @route PUT /api/v1/pagamentos/:id
 */
exports.atualizarPagamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      status,
      comprovante_url
    } = req.body;
    
    const pagamento = await Pagamento.findByPk(id);
    
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    // Atualizar o pagamento
    const camposAtualizados = {};
    
    if (descricao) camposAtualizados.descricao = descricao;
    if (valor) camposAtualizados.valor = valor;
    if (data_vencimento) camposAtualizados.data_vencimento = data_vencimento;
    if (data_pagamento !== undefined) camposAtualizados.data_pagamento = data_pagamento;
    if (status) camposAtualizados.status = status;
    if (comprovante_url) camposAtualizados.comprovante_url = comprovante_url;
    
    await pagamento.update(camposAtualizados);
    
    logger.info(`Pagamento atualizado: ${id}`);
    
    return res.json({
      message: 'Pagamento atualizado com sucesso',
      pagamento
    });
  } catch (error) {
    logger.error(`Erro ao atualizar pagamento ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove um pagamento (soft delete)
 * @route DELETE /api/v1/pagamentos/:id
 */
exports.removerPagamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const pagamento = await Pagamento.findByPk(id);
    
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    // Remover o pagamento (soft delete)
    await pagamento.destroy();
    
    logger.info(`Pagamento removido: ${id}`);
    
    return res.json({
      message: 'Pagamento removido com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao remover pagamento ID ${req.params.id}:`, error);
    next(error);
  }
};