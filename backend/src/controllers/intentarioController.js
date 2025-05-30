const { Inventario, Condominio, ManutencaoInventario, Manutencao } = require('../models');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controller para gerenciamento de inventário
 */
const inventarioController = {
  /**
   * Listar itens do inventário com paginação e filtros
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
        categoria,
        status,
        estoqueMinimo,
        ordenarPor = 'nome'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (search) {
        whereClause[Op.or] = [
          { nome: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
          { categoria: { [Op.like]: `%${search}%` } },
          { fornecedor: { [Op.like]: `%${search}%` } }
        ];
      }

      if (condominioId) {
        whereClause.condominioId = condominioId;
      }

      if (categoria) {
        whereClause.categoria = categoria;
      }

      if (status) {
        whereClause.status = status;
      }

      // Filtro para estoque mínimo
      if (estoqueMinimo === 'true') {
        whereClause[Op.and] = [
          { quantidade: { [Op.lte]: sequelize.col('estoqueMinimo') } },
          { status: 'ATIVO' }
        ];
      }

      // Definir ordenação
      let orderBy = [['nome', 'ASC']];
      switch (ordenarPor) {
        case 'quantidade':
          orderBy = [['quantidade', 'ASC']];
          break;
        case 'categoria':
          orderBy = [['categoria', 'ASC'], ['nome', 'ASC']];
          break;
        case 'valor':
          orderBy = [['valorUnitario', 'DESC']];
          break;
        case 'dataAtualizacao':
          orderBy = [['updatedAt', 'DESC']];
          break;
      }

      // Buscar itens do inventário
      const { rows: itens, count: total } = await Inventario.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orderBy
      });

      // Calcular informações adicionais
      const itensComInfo = itens.map(item => {
        const itemObj = item.toJSON();
        
        // Calcular valor total em estoque
        itemObj.valorTotalEstoque = itemObj.quantidade * (itemObj.valorUnitario || 0);
        
        // Verificar se está abaixo do estoque mínimo
        itemObj.abaixoEstoqueMinimo = itemObj.quantidade <= (itemObj.estoqueMinimo || 0);
        
        return itemObj;
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      logger.info(`Itens do inventário listados: ${itens.length} de ${total}`, {
        userId: req.user.id,
        filters: { search, condominioId, categoria, status, estoqueMinimo }
      });

      res.json({
        success: true,
        data: {
          itens: itensComInfo,
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
      logger.error('Erro ao listar inventário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar novo item no inventário
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
        nome,
        descricao,
        categoria,
        unidade,
        quantidade,
        estoqueMinimo,
        valorUnitario,
        fornecedor,
        localizacao,
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

      // Verificar se item já existe no condomínio
      const itemExistente = await Inventario.findOne({
        where: {
          condominioId,
          nome: { [Op.iLike]: nome }
        }
      });

      if (itemExistente) {
        return res.status(409).json({
          success: false,
          message: 'Item já existe no inventário deste condomínio'
        });
      }

      // Criar item
      const item = await Inventario.create({
        condominioId,
        nome,
        descricao,
        categoria: categoria || 'GERAL',
        unidade: unidade || 'UNIDADE',
        quantidade: quantidade || 0,
        estoqueMinimo: estoqueMinimo || 0,
        valorUnitario,
        fornecedor,
        localizacao,
        observacoes,
        status: 'ATIVO'
      });

      // Buscar item criado com relacionamentos
      const itemCriado = await Inventario.findByPk(item.id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      logger.info(`Item do inventário criado: ${item.id}`, {
        userId: req.user.id,
        itemId: item.id,
        condominioId,
        nome
      });

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: itemCriado
      });

    } catch (error) {
      logger.error('Erro ao criar item do inventário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar item por ID
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const item = await Inventario.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome', 'endereco']
          }
        ]
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      // Buscar histórico de manutenções que usaram este item
      const manutencoes = await ManutencaoInventario.findAll({
        where: { inventarioId: id },
        include: [
          {
            model: Manutencao,
            as: 'manutencao',
            attributes: ['id', 'numero', 'titulo', 'status', 'dataAbertura'],
            include: [
              {
                model: require('../models').Unidade,
                as: 'unidade',
                attributes: ['id', 'numero', 'bloco']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      // Calcular informações adicionais
      const itemInfo = {
        ...item.toJSON(),
        valorTotalEstoque: item.quantidade * (item.valorUnitario || 0),
        abaixoEstoqueMinimo: item.quantidade <= (item.estoqueMinimo || 0),
        historicoManutencoes: manutencoes
      };

      logger.info(`Item do inventário consultado: ${id}`, {
        userId: req.user.id,
        itemId: id
      });

      res.json({
        success: true,
        data: itemInfo
      });

    } catch (error) {
      logger.error('Erro ao buscar item do inventário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar item
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
        descricao,
        categoria,
        unidade,
        quantidade,
        estoqueMinimo,
        valorUnitario,
        fornecedor,
        localizacao,
        observacoes,
        status
      } = req.body;

      // Verificar se item existe
      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      // Verificar duplicação de nome se foi alterado
      if (nome && nome !== item.nome) {
        const nomeExistente = await Inventario.findOne({
          where: {
            condominioId: item.condominioId,
            nome: { [Op.iLike]: nome },
            id: { [Op.ne]: id }
          }
        });

        if (nomeExistente) {
          return res.status(409).json({
            success: false,
            message: 'Nome já existe no inventário deste condomínio'
          });
        }
      }

      // Atualizar item
      await item.update({
        nome,
        descricao,
        categoria,
        unidade,
        quantidade,
        estoqueMinimo,
        valorUnitario,
        fornecedor,
        localizacao,
        observacoes,
        status
      });

      // Buscar item atualizado com relacionamentos
      const itemAtualizado = await Inventario.findByPk(id, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      logger.info(`Item do inventário atualizado: ${id}`, {
        userId: req.user.id,
        itemId: id
      });

      res.json({
        success: true,
        message: 'Item atualizado com sucesso',
        data: itemAtualizado
      });

    } catch (error) {
      logger.error('Erro ao atualizar item do inventário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir item
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      // Verificar se existem manutenções associadas
      const manutencaoCount = await ManutencaoInventario.count({
        where: { inventarioId: id }
      });

      if (manutencaoCount > 0) {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir o item pois existem manutenções associadas'
        });
      }

      await item.destroy();

      logger.info(`Item do inventário excluído: ${id}`, {
        userId: req.user.id,
        itemId: id
      });

      res.json({
        success: true,
        message: 'Item excluído com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao excluir item do inventário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar estoque
   */
  async atualizarEstoque(req, res) {
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
      const { tipo, quantidade, observacoes } = req.body;

      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item não encontrado'
        });
      }

      let novaQuantidade = item.quantidade;

      // Calcular nova quantidade baseada no tipo de movimentação
      switch (tipo) {
        case 'ENTRADA':
          novaQuantidade += parseInt(quantidade);
          break;
        case 'SAIDA':
          novaQuantidade -= parseInt(quantidade);
          if (novaQuantidade < 0) {
            return res.status(400).json({
              success: false,
              message: 'Quantidade insuficiente em estoque'
            });
          }
          break;
        case 'AJUSTE':
          novaQuantidade = parseInt(quantidade);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de movimentação inválido'
          });
      }

      // Atualizar estoque
      await item.update({ quantidade: novaQuantidade });

      // Registrar observações se fornecidas
      if (observacoes) {
        const observacoesAtuais = item.observacoes || '';
        const novaObservacao = `\n[${new Date().toLocaleDateString('pt-BR')} - ${req.user.nome}]: ${tipo} de ${quantidade} unidades. ${observacoes}`;
        await item.update({ observacoes: observacoesAtuais + novaObservacao });
      }

      logger.info(`Estoque atualizado: ${id}`, {
        userId: req.user.id,
        itemId: id,
        tipo,
        quantidadeAnterior: item.quantidade,
        quantidadeNova: novaQuantidade
      });

      res.json({
        success: true,
        message: 'Estoque atualizado com sucesso',
        data: {
          id: item.id,
          nome: item.nome,
          quantidadeAnterior: item.quantidade,
          quantidadeAtual: novaQuantidade,
          tipo,
          quantidade: parseInt(quantidade)
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar estoque:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar itens com estoque baixo
   */
  async estoqueBaixo(req, res) {
    try {
      const { condominioId } = req.query;

      const whereClause = {
        status: 'ATIVO',
        [Op.and]: [
          { quantidade: { [Op.lte]: require('sequelize').col('estoqueMinimo') } }
        ]
      };

      if (condominioId) {
        whereClause.condominioId = condominioId;
      }

      const itens = await Inventario.findAll({
        where: whereClause,
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ],
        order: [['quantidade', 'ASC']]
      });

      // Calcular informações adicionais
      const itensComInfo = itens.map(item => ({
        ...item.toJSON(),
        percentualEstoque: item.estoqueMinimo > 0 ? 
          Math.round((item.quantidade / item.estoqueMinimo) * 100) : 0,
        faltante: Math.max(0, item.estoqueMinimo - item.quantidade)
      }));

      logger.info(`Itens com estoque baixo consultados: ${itens.length}`, {
        userId: req.user.id,
        condominioId
      });

      res.json({
        success: true,
        data: itensComInfo
      });

    } catch (error) {
      logger.error('Erro ao buscar itens com estoque baixo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Listar categorias disponíveis
   */
  async listarCategorias(req, res) {
    try {
      const categorias = [
        { value: 'LIMPEZA', label: 'Limpeza' },
        { value: 'MANUTENCAO', label: 'Manutenção' },
        { value: 'FERRAMENTAS', label: 'Ferramentas' },
        { value: 'ELETRICOS', label: 'Elétricos' },
        { value: 'HIDRAULICOS', label: 'Hidráulicos' },
        { value: 'SEGURANCA', label: 'Segurança' },
        { value: 'JARDINAGEM', label: 'Jardinagem' },
        { value: 'MATERIAIS', label: 'Materiais' },
        { value: 'EQUIPAMENTOS', label: 'Equipamentos' },
        { value: 'GERAL', label: 'Geral' }
      ];

      res.json({
        success: true,
        data: categorias
      });

    } catch (error) {
      logger.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Relatório de estoque
   */
  async relatorioEstoque(req, res) {
    try {
      const { condominioId } = req.query;

      const whereClause = { status: 'ATIVO' };
      if (condominioId) {
        whereClause.condominioId = condominioId;
      }

      const itens = await Inventario.findAll({
        where: whereClause,
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ],
        order: [['categoria', 'ASC'], ['nome', 'ASC']]
      });

      // Calcular estatísticas
      const totalItens = itens.length;
      const totalValorEstoque = itens.reduce((acc, item) => 
        acc + (item.quantidade * (item.valorUnitario || 0)), 0);
      const itensAbaixoMinimo = itens.filter(item => 
        item.quantidade <= item.estoqueMinimo).length;

      // Agrupar por categoria
      const itensPorCategoria = itens.reduce((acc, item) => {
        const categoria = item.categoria || 'GERAL';
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push({
          ...item.toJSON(),
          valorTotalEstoque: item.quantidade * (item.valorUnitario || 0),
          abaixoEstoqueMinimo: item.quantidade <= item.estoqueMinimo
        });
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          estatisticas: {
            totalItens,
            totalValorEstoque,
            itensAbaixoMinimo,
            percentualAbaixoMinimo: totalItens > 0 ? 
              Math.round((itensAbaixoMinimo / totalItens) * 100) : 0
          },
          itensPorCategoria
        }
      });

    } catch (error) {
      logger.error('Erro ao gerar relatório de estoque:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = inventarioController;