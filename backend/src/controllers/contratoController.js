const { Contrato, Fornecedor, Condominio } = require('../models');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controller para gerenciamento de contratos
 */
const contratoController = {
  /**
   * Listar contratos com paginação e filtros
   */
  async listar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 10,
        search,
        fornecedorId,
        condominioId,
        status,
        tipo,
        dataInicio,
        dataFim,
        vencendoEm // dias para vencimento
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (search) {
        whereClause[Op.or] = [
          { objeto: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }

      if (fornecedorId) {
        whereClause.fornecedorId = fornecedorId;
      }

      if (condominioId) {
        whereClause.condominioId = condominioId;
      }

      if (status) {
        whereClause.status = status;
      }

      if (tipo) {
        whereClause.tipo = tipo;
      }

      // Filtro por data de início
      if (dataInicio && dataFim) {
        whereClause.dataInicio = {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)]
        };
      } else if (dataInicio) {
        whereClause.dataInicio = {
          [Op.gte]: new Date(dataInicio)
        };
      } else if (dataFim) {
        whereClause.dataInicio = {
          [Op.lte]: new Date(dataFim)
        };
      }

      // Filtro para contratos vencendo
      if (vencendoEm) {
        const diasVencimento = parseInt(vencendoEm);
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + diasVencimento);
        
        whereClause.dataFim = {
          [Op.between]: [new Date(), dataLimite]
        };
        whereClause.status = 'ATIVO';
      }

      // Buscar contratos com relacionamentos
      const { rows: contratos, count: total } = await Contrato.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj', 'telefone', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['dataFim', 'ASC'], ['dataInicio', 'DESC']]
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      logger.info(`Contratos listados: ${contratos.length} de ${total}`, {
        userId: req.user.id,
        filters: { search, fornecedorId, condominioId, status, tipo }
      });

      res.json({
        success: true,
        data: {
          contratos,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNext,
            hasPrev
          }
        }
      });

    } catch (error) {
      logger.error('Erro ao listar contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar novo contrato
   */
  async criar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const {
        fornecedorId,
        condominioId,
        objeto,
        descricao,
        tipo,
        valor,
        dataInicio,
        dataFim,
        clausulas,
        observacoes
      } = req.body;

      // Verificar se fornecedor existe
      const fornecedor = await Fornecedor.findByPk(fornecedorId);
      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      // Verificar se condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          success: false,
          message: 'Condomínio não encontrado'
        });
      }

      // Gerar número do contrato
      const anoAtual = new Date().getFullYear();
      const ultimoContrato = await Contrato.findOne({
        where: {
          numero: {
            [Op.like]: `${anoAtual}%`
          }
        },
        order: [['numero', 'DESC']]
      });

      let proximoNumero = 1;
      if (ultimoContrato) {
        const ultimoNumero = parseInt(ultimoContrato.numero.split('/')[0]);
        proximoNumero = ultimoNumero + 1;
      }

      const numero = `${proximoNumero.toString().padStart(4, '0')}/${anoAtual}`;

      // Criar contrato
      const contrato = await Contrato.create({
        numero,
        fornecedorId,
        condominioId,
        objeto,
        descricao,
        tipo: tipo || 'SERVICO',
        valor,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        clausulas,
        observacoes,
        status: 'ATIVO',
        dataAssinatura: new Date()
      });

      // Buscar contrato criado com relacionamentos
      const contratoCriado = await Contrato.findByPk(contrato.id, {
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj', 'telefone', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          }
        ]
      });

      logger.info(`Contrato criado: ${contrato.id}`, {
        userId: req.user.id,
        contratoId: contrato.id,
        fornecedorId,
        condominioId,
        numero
      });

      res.status(201).json({
        success: true,
        message: 'Contrato criado com sucesso',
        data: contratoCriado
      });

    } catch (error) {
      logger.error('Erro ao criar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar contrato por ID
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id, {
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj', 'telefone', 'email', 'endereco', 'responsavel']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco', 'telefone', 'email']
          }
        ]
      });

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      // Calcular dias para vencimento
      const hoje = new Date();
      const dataFim = new Date(contrato.dataFim);
      const diasParaVencimento = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));

      logger.info(`Contrato consultado: ${id}`, {
        userId: req.user.id,
        contratoId: id
      });

      res.json({
        success: true,
        data: {
          ...contrato.toJSON(),
          diasParaVencimento
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar contrato
   */
  async atualizar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const {
        objeto,
        descricao,
        tipo,
        valor,
        dataInicio,
        dataFim,
        clausulas,
        observacoes,
        status
      } = req.body;

      // Verificar se contrato existe
      const contrato = await Contrato.findByPk(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {
        objeto,
        descricao,
        tipo,
        valor,
        clausulas,
        observacoes,
        status
      };

      if (dataInicio) {
        dadosAtualizacao.dataInicio = new Date(dataInicio);
      }

      if (dataFim) {
        dadosAtualizacao.dataFim = new Date(dataFim);
      }

      // Se status mudou para FINALIZADO, adicionar data de finalização
      if (status === 'FINALIZADO' && contrato.status !== 'FINALIZADO') {
        dadosAtualizacao.dataFinalizacao = new Date();
      }

      // Atualizar contrato
      await contrato.update(dadosAtualizacao);

      // Buscar contrato atualizado com relacionamentos
      const contratoAtualizado = await Contrato.findByPk(id, {
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj', 'telefone', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          }
        ]
      });

      logger.info(`Contrato atualizado: ${id}`, {
        userId: req.user.id,
        contratoId: id,
        statusAnterior: contrato.status,
        statusAtual: status
      });

      res.json({
        success: true,
        message: 'Contrato atualizado com sucesso',
        data: contratoAtualizado
      });

    } catch (error) {
      logger.error('Erro ao atualizar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir contrato
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      // Verificar se pode excluir (apenas se não estiver finalizado)
      if (contrato.status === 'FINALIZADO') {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir contrato finalizado'
        });
      }

      await contrato.destroy();

      logger.info(`Contrato excluído: ${id}`, {
        userId: req.user.id,
        contratoId: id
      });

      res.json({
        success: true,
        message: 'Contrato excluído com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao excluir contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar contratos por fornecedor
   */
  async buscarPorFornecedor(req, res) {
    try {
      const { fornecedorId } = req.params;
      const { status, limit = 10 } = req.query;

      // Verificar se fornecedor existe
      const fornecedor = await Fornecedor.findByPk(fornecedorId);
      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      const whereClause = { fornecedorId };
      if (status) {
        whereClause.status = status;
      }

      const contratos = await Contrato.findAll({
        where: whereClause,
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          }
        ],
        order: [['dataInicio', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: contratos
      });

    } catch (error) {
      logger.error('Erro ao buscar contratos por fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar contratos vencendo
   */
  async contratosVencendo(req, res) {
    try {
      const { dias = 30 } = req.query;

      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + parseInt(dias));

      const contratos = await Contrato.findAll({
        where: {
          dataFim: {
            [Op.between]: [new Date(), dataLimite]
          },
          status: 'ATIVO'
        },
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'telefone', 'email']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ],
        order: [['dataFim', 'ASC']]
      });

      // Calcular dias para vencimento para cada contrato
      const hoje = new Date();
      const contratosComDias = contratos.map(contrato => {
        const dataFim = new Date(contrato.dataFim);
        const diasParaVencimento = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
        
        return {
          ...contrato.toJSON(),
          diasParaVencimento
        };
      });

      logger.info(`Contratos vencendo consultados: ${contratos.length}`, {
        userId: req.user.id,
        dias: parseInt(dias)
      });

      res.json({
        success: true,
        data: contratosComDias
      });

    } catch (error) {
      logger.error('Erro ao buscar contratos vencendo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Renovar contrato
   */
  async renovar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { novaDataFim, novoValor, observacoes } = req.body;

      const contrato = await Contrato.findByPk(id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
      }

      // Gerar novo número de contrato para a renovação
      const anoAtual = new Date().getFullYear();
      const ultimoContrato = await Contrato.findOne({
        where: {
          numero: {
            [Op.like]: `${anoAtual}%`
          }
        },
        order: [['numero', 'DESC']]
      });

      let proximoNumero = 1;
      if (ultimoContrato) {
        const ultimoNumero = parseInt(ultimoContrato.numero.split('/')[0]);
        proximoNumero = ultimoNumero + 1;
      }

      const novoNumero = `${proximoNumero.toString().padStart(4, '0')}/${anoAtual}`;

      // Finalizar contrato atual
      await contrato.update({
        status: 'FINALIZADO',
        dataFinalizacao: new Date()
      });

      // Criar novo contrato (renovação)
      const novoContrato = await Contrato.create({
        numero: novoNumero,
        fornecedorId: contrato.fornecedorId,
        condominioId: contrato.condominioId,
        objeto: contrato.objeto,
        descricao: contrato.descricao,
        tipo: contrato.tipo,
        valor: novoValor || contrato.valor,
        dataInicio: new Date(),
        dataFim: new Date(novaDataFim),
        clausulas: contrato.clausulas,
        observacoes: observacoes || `Renovação do contrato ${contrato.numero}`,
        status: 'ATIVO',
        dataAssinatura: new Date()
      });

      // Buscar novo contrato com relacionamentos
      const contratoRenovado = await Contrato.findByPk(novoContrato.id, {
        include: [
          {
            model: Fornecedor,
            as: 'fornecedor',
            attributes: ['id', 'nome', 'cnpj']
          },
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      logger.info(`Contrato renovado: ${id} -> ${novoContrato.id}`, {
        userId: req.user.id,
        contratoAnteriorId: id,
        novoContratoId: novoContrato.id
      });

      res.json({
        success: true,
        message: 'Contrato renovado com sucesso',
        data: contratoRenovado
      });

    } catch (error) {
      logger.error('Erro ao renovar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = contratoController;