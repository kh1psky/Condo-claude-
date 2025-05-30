const { Unidade, Condominio, Usuario, Pagamento } = require('../models');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controller para gerenciamento de unidades
 */
const unidadeController = {
  /**
   * Listar unidades com paginação e filtros
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
        condominioId,
        status,
        tipo,
        proprietarioId
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (search) {
        whereClause[Op.or] = [
          { numero: { [Op.like]: `%${search}%` } },
          { bloco: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
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

      if (proprietarioId) {
        whereClause.proprietarioId = proprietarioId;
      }

      // Buscar unidades com relacionamentos
      const { rows: unidades, count: total } = await Unidade.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['condominioId', 'ASC'],
          ['bloco', 'ASC'],
          ['numero', 'ASC']
        ]
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      logger.info(`Unidades listadas: ${unidades.length} de ${total}`, {
        userId: req.user.id,
        filters: { search, condominioId, status, tipo, proprietarioId }
      });

      res.json({
        success: true,
        data: {
          unidades,
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
      logger.error('Erro ao listar unidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar nova unidade
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
        condominioId,
        numero,
        bloco,
        andar,
        tipo,
        area,
        quartos,
        banheiros,
        vagas,
        valorIptu,
        valorCondominio,
        proprietarioId,
        observacoes
      } = req.body;

      // Verificar se condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          success: false,
          message: 'Condomínio não encontrado'
        });
      }

      // Verificar se proprietário existe (se fornecido)
      if (proprietarioId) {
        const proprietario = await Usuario.findByPk(proprietarioId);
        if (!proprietario) {
          return res.status(404).json({
            success: false,
            message: 'Proprietário não encontrado'
          });
        }
      }

      // Verificar duplicação (mesmo número/bloco no condomínio)
      const unidadeExistente = await Unidade.findOne({
        where: {
          condominioId,
          numero,
          bloco: bloco || null
        }
      });

      if (unidadeExistente) {
        return res.status(409).json({
          success: false,
          message: 'Já existe uma unidade com este número/bloco neste condomínio'
        });
      }

      // Criar unidade
      const unidade = await Unidade.create({
        condominioId,
        numero,
        bloco,
        andar,
        tipo: tipo || 'APARTAMENTO',
        area,
        quartos,
        banheiros,
        vagas,
        valorIptu,
        valorCondominio,
        proprietarioId,
        observacoes,
        status: 'ATIVA'
      });

      // Buscar unidade criada com relacionamentos
      const unidadeCriada = await Unidade.findByPk(unidade.id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone'],
            required: false
          }
        ]
      });

      logger.info(`Unidade criada: ${unidade.id}`, {
        userId: req.user.id,
        unidadeId: unidade.id,
        condominioId
      });

      res.status(201).json({
        success: true,
        message: 'Unidade criada com sucesso',
        data: unidadeCriada
      });

    } catch (error) {
      logger.error('Erro ao criar unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar unidade por ID
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const unidade = await Unidade.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco', 'telefone']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone', 'cpf'],
            required: false
          }
        ]
      });

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      // Buscar últimos pagamentos da unidade
      const ultimosPagamentos = await Pagamento.findAll({
        where: { unidadeId: id },
        order: [['dataVencimento', 'DESC']],
        limit: 5,
        attributes: ['id', 'tipo', 'valor', 'dataVencimento', 'dataPagamento', 'status']
      });

      logger.info(`Unidade consultada: ${id}`, {
        userId: req.user.id,
        unidadeId: id
      });

      res.json({
        success: true,
        data: {
          ...unidade.toJSON(),
          ultimosPagamentos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar unidade
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
        numero,
        bloco,
        andar,
        tipo,
        area,
        quartos,
        banheiros,
        vagas,
        valorIptu,
        valorCondominio,
        proprietarioId,
        observacoes,
        status
      } = req.body;

      // Verificar se unidade existe
      const unidade = await Unidade.findByPk(id);
      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      // Verificar se proprietário existe (se fornecido)
      if (proprietarioId) {
        const proprietario = await Usuario.findByPk(proprietarioId);
        if (!proprietario) {
          return res.status(404).json({
            success: false,
            message: 'Proprietário não encontrado'
          });
        }
      }

      // Verificar duplicação se número/bloco foi alterado
      if (numero !== unidade.numero || bloco !== unidade.bloco) {
        const unidadeExistente = await Unidade.findOne({
          where: {
            condominioId: unidade.condominioId,
            numero,
            bloco: bloco || null,
            id: { [Op.ne]: id }
          }
        });

        if (unidadeExistente) {
          return res.status(409).json({
            success: false,
            message: 'Já existe uma unidade com este número/bloco neste condomínio'
          });
        }
      }

      // Atualizar unidade
      await unidade.update({
        numero,
        bloco,
        andar,
        tipo,
        area,
        quartos,
        banheiros,
        vagas,
        valorIptu,
        valorCondominio,
        proprietarioId,
        observacoes,
        status
      });

      // Buscar unidade atualizada com relacionamentos
      const unidadeAtualizada = await Unidade.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone'],
            required: false
          }
        ]
      });

      logger.info(`Unidade atualizada: ${id}`, {
        userId: req.user.id,
        unidadeId: id
      });

      res.json({
        success: true,
        message: 'Unidade atualizada com sucesso',
        data: unidadeAtualizada
      });

    } catch (error) {
      logger.error('Erro ao atualizar unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir unidade
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const unidade = await Unidade.findByPk(id);
      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      // Verificar se existem pagamentos associados
      const pagamentosCount = await Pagamento.count({
        where: { unidadeId: id }
      });

      if (pagamentosCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir a unidade pois existem pagamentos associados'
        });
      }

      await unidade.destroy();

      logger.info(`Unidade excluída: ${id}`, {
        userId: req.user.id,
        unidadeId: id
      });

      res.json({
        success: true,
        message: 'Unidade excluída com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao excluir unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar unidades por condomínio
   */
  async listarPorCondominio(req, res) {
    try {
      const { condominioId } = req.params;
      const { incluirProprietario = true } = req.query;

      // Verificar se condomínio existe
      const condominio = await Condominio.findByPk(condominioId);
      if (!condominio) {
        return res.status(404).json({
          success: false,
          message: 'Condomínio não encontrado'
        });
      }

      const includeOptions = [];
      
      if (incluirProprietario === 'true') {
        includeOptions.push({
          model: Usuario,
          as: 'proprietario',
          attributes: ['id', 'nome', 'email', 'telefone'],
          required: false
        });
      }

      const unidades = await Unidade.findAll({
        where: { condominioId },
        include: includeOptions,
        order: [
          ['bloco', 'ASC'],
          ['numero', 'ASC']
        ]
      });

      logger.info(`Unidades listadas por condomínio: ${condominioId}`, {
        userId: req.user.id,
        condominioId,
        total: unidades.length
      });

      res.json({
        success: true,
        data: unidades
      });

    } catch (error) {
      logger.error('Erro ao listar unidades por condomínio:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Associar proprietário à unidade
   */
  async associarProprietario(req, res) {
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
      const { proprietarioId } = req.body;

      // Verificar se unidade existe
      const unidade = await Unidade.findByPk(id);
      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      // Verificar se proprietário existe
      const proprietario = await Usuario.findByPk(proprietarioId);
      if (!proprietario) {
        return res.status(404).json({
          success: false,
          message: 'Proprietário não encontrado'
        });
      }

      // Atualizar associação
      await unidade.update({ proprietarioId });

      // Buscar unidade atualizada com relacionamentos
      const unidadeAtualizada = await Unidade.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          },
          {
            model: Usuario,
            as: 'proprietario',
            attributes: ['id', 'nome', 'email', 'telefone']
          }
        ]
      });

      logger.info(`Proprietário associado à unidade: ${id}`, {
        userId: req.user.id,
        unidadeId: id,
        proprietarioId
      });

      res.json({
        success: true,
        message: 'Proprietário associado com sucesso',
        data: unidadeAtualizada
      });

    } catch (error) {
      logger.error('Erro ao associar proprietário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Remover associação de proprietário
   */
  async removerProprietario(req, res) {
    try {
      const { id } = req.params;

      const unidade = await Unidade.findByPk(id);
      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      await unidade.update({ proprietarioId: null });

      logger.info(`Proprietário removido da unidade: ${id}`, {
        userId: req.user.id,
        unidadeId: id
      });

      res.json({
        success: true,
        message: 'Proprietário removido com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao remover proprietário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = unidadeController;