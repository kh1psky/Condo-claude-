const { Fornecedor, Contrato } = require('../models');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controller para gerenciamento de fornecedores
 */
const fornecedorController = {
  /**
   * Listar fornecedores com paginação e filtros
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
        tipo,
        status,
        cidade,
        uf
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (search) {
        whereClause[Op.or] = [
          { nome: { [Op.like]: `%${search}%` } },
          { cnpj: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }

      if (tipo) {
        whereClause.tipo = tipo;
      }

      if (status) {
        whereClause.status = status;
      }

      if (cidade) {
        whereClause.cidade = { [Op.like]: `%${cidade}%` };
      }

      if (uf) {
        whereClause.uf = uf;
      }

      // Buscar fornecedores
      const { rows: fornecedores, count: total } = await Fornecedor.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome', 'ASC']]
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      logger.info(`Fornecedores listados: ${fornecedores.length} de ${total}`, {
        userId: req.user.id,
        filters: { search, tipo, status, cidade, uf }
      });

      res.json({
        success: true,
        data: {
          fornecedores,
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
      logger.error('Erro ao listar fornecedores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar novo fornecedor
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
        nome,
        cnpj,
        email,
        telefone,
        celular,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        tipo,
        responsavel,
        observacoes
      } = req.body;

      // Verificar se CNPJ já existe
      if (cnpj) {
        const fornecedorExistente = await Fornecedor.findOne({
          where: { cnpj }
        });

        if (fornecedorExistente) {
          return res.status(409).json({
            success: false,
            message: 'CNPJ já cadastrado'
          });
        }
      }

      // Verificar se email já existe
      if (email) {
        const emailExistente = await Fornecedor.findOne({
          where: { email }
        });

        if (emailExistente) {
          return res.status(409).json({
            success: false,
            message: 'Email já cadastrado'
          });
        }
      }

      // Criar fornecedor
      const fornecedor = await Fornecedor.create({
        nome,
        cnpj,
        email,
        telefone,
        celular,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        tipo: tipo || 'SERVICOS',
        responsavel,
        observacoes,
        status: 'ATIVO'
      });

      logger.info(`Fornecedor criado: ${fornecedor.id}`, {
        userId: req.user.id,
        fornecedorId: fornecedor.id,
        nome
      });

      res.status(201).json({
        success: true,
        message: 'Fornecedor criado com sucesso',
        data: fornecedor
      });

    } catch (error) {
      logger.error('Erro ao criar fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar fornecedor por ID
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findByPk(id);

      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      // Buscar contratos do fornecedor
      const contratos = await Contrato.findAll({
        where: { fornecedorId: id },
        attributes: ['id', 'objeto', 'valor', 'dataInicio', 'dataFim', 'status'],
        order: [['dataInicio', 'DESC']],
        limit: 5
      });

      logger.info(`Fornecedor consultado: ${id}`, {
        userId: req.user.id,
        fornecedorId: id
      });

      res.json({
        success: true,
        data: {
          ...fornecedor.toJSON(),
          contratos
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar fornecedor
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
        nome,
        cnpj,
        email,
        telefone,
        celular,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        tipo,
        responsavel,
        observacoes,
        status
      } = req.body;

      // Verificar se fornecedor existe
      const fornecedor = await Fornecedor.findByPk(id);
      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      // Verificar duplicação de CNPJ se foi alterado
      if (cnpj && cnpj !== fornecedor.cnpj) {
        const cnpjExistente = await Fornecedor.findOne({
          where: {
            cnpj,
            id: { [Op.ne]: id }
          }
        });

        if (cnpjExistente) {
          return res.status(409).json({
            success: false,
            message: 'CNPJ já cadastrado para outro fornecedor'
          });
        }
      }

      // Verificar duplicação de email se foi alterado
      if (email && email !== fornecedor.email) {
        const emailExistente = await Fornecedor.findOne({
          where: {
            email,
            id: { [Op.ne]: id }
          }
        });

        if (emailExistente) {
          return res.status(409).json({
            success: false,
            message: 'Email já cadastrado para outro fornecedor'
          });
        }
      }

      // Atualizar fornecedor
      await fornecedor.update({
        nome,
        cnpj,
        email,
        telefone,
        celular,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        tipo,
        responsavel,
        observacoes,
        status
      });

      logger.info(`Fornecedor atualizado: ${id}`, {
        userId: req.user.id,
        fornecedorId: id
      });

      res.json({
        success: true,
        message: 'Fornecedor atualizado com sucesso',
        data: fornecedor
      });

    } catch (error) {
      logger.error('Erro ao atualizar fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir fornecedor
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const fornecedor = await Fornecedor.findByPk(id);
      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      // Verificar se existem contratos associados
      const contratosCount = await Contrato.count({
        where: { fornecedorId: id }
      });

      if (contratosCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir o fornecedor pois existem contratos associados'
        });
      }

      await fornecedor.destroy();

      logger.info(`Fornecedor excluído: ${id}`, {
        userId: req.user.id,
        fornecedorId: id
      });

      res.json({
        success: true,
        message: 'Fornecedor excluído com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao excluir fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar fornecedores por tipo
   */
  async buscarPorTipo(req, res) {
    try {
      const { tipo } = req.params;
      const { status = 'ATIVO' } = req.query;

      const fornecedores = await Fornecedor.findAll({
        where: {
          tipo,
          status
        },
        attributes: ['id', 'nome', 'telefone', 'email', 'responsavel'],
        order: [['nome', 'ASC']]
      });

      logger.info(`Fornecedores listados por tipo: ${tipo}`, {
        userId: req.user.id,
        tipo,
        total: fornecedores.length
      });

      res.json({
        success: true,
        data: fornecedores
      });

    } catch (error) {
      logger.error('Erro ao buscar fornecedores por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar tipos de fornecedores disponíveis
   */
  async listarTipos(req, res) {
    try {
      const tipos = [
        { value: 'SERVICOS', label: 'Serviços' },
        { value: 'MANUTENCAO', label: 'Manutenção' },
        { value: 'LIMPEZA', label: 'Limpeza' },
        { value: 'SEGURANCA', label: 'Segurança' },
        { value: 'JARDINAGEM', label: 'Jardinagem' },
        { value: 'MATERIAIS', label: 'Materiais' },
        { value: 'EQUIPAMENTOS', label: 'Equipamentos' },
        { value: 'CONSULTORIA', label: 'Consultoria' },
        { value: 'OUTROS', label: 'Outros' }
      ];

      res.json({
        success: true,
        data: tipos
      });

    } catch (error) {
      logger.error('Erro ao listar tipos de fornecedores:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Ativar/Desativar fornecedor
   */
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const fornecedor = await Fornecedor.findByPk(id);
      if (!fornecedor) {
        return res.status(404).json({
          success: false,
          message: 'Fornecedor não encontrado'
        });
      }

      await fornecedor.update({ status });

      logger.info(`Status do fornecedor alterado: ${id}`, {
        userId: req.user.id,
        fornecedorId: id,
        statusAnterior: fornecedor.status,
        statusAtual: status
      });

      res.json({
        success: true,
        message: `Fornecedor ${status === 'ATIVO' ? 'ativado' : 'desativado'} com sucesso`,
        data: {
          id: fornecedor.id,
          status: status
        }
      });

    } catch (error) {
      logger.error('Erro ao alterar status do fornecedor:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = fornecedorController;