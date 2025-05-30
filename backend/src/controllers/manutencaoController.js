const { Manutencao, Unidade, Condominio, Usuario, Inventario, ManutencaoInventario } = require('../models');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * Controller para gerenciamento de manutenções
 */
const manutencaoController = {
  /**
   * Listar manutenções com paginação e filtros
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
        unidadeId,
        condominioId,
        status,
        prioridade,
        tipo,
        responsavelId,
        dataInicio,
        dataFim
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtros
      if (search) {
        whereClause[Op.or] = [
          { titulo: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }

      if (unidadeId) {
        whereClause.unidadeId = unidadeId;
      }

      if (status) {
        whereClause.status = status;
      }

      if (prioridade) {
        whereClause.prioridade = prioridade;
      }

      if (tipo) {
        whereClause.tipo = tipo;
      }

      if (responsavelId) {
        whereClause.responsavelId = responsavelId;
      }

      // Filtro por data
      if (dataInicio && dataFim) {
        whereClause.dataAbertura = {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)]
        };
      } else if (dataInicio) {
        whereClause.dataAbertura = {
          [Op.gte]: new Date(dataInicio)
        };
      } else if (dataFim) {
        whereClause.dataAbertura = {
          [Op.lte]: new Date(dataFim)
        };
      }

      // Configurar includes
      const includeOptions = [
        {
          model: Unidade,
          as: 'unidade',
          attributes: ['id', 'numero', 'bloco', 'condominioId'],
          include: [
            {
              model: Condominio,
              as: 'condominio',
              attributes: ['id', 'nome', 'endereco'],
              where: condominioId ? { id: condominioId } : {}
            }
          ]
        },
        {
          model: Usuario,
          as: 'solicitante',
          attributes: ['id', 'nome', 'email', 'telefone']
        },
        {
          model: Usuario,
          as: 'responsavel',
          attributes: ['id', 'nome', 'email', 'telefone'],
          required: false
        }
      ];

      // Buscar manutenções com relacionamentos
      const { rows: manutencoes, count: total } = await Manutencao.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['prioridade', 'DESC'],
          ['dataAbertura', 'DESC']
        ],
        distinct: true
      });

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      logger.info(`Manutenções listadas: ${manutencoes.length} de ${total}`, {
        userId: req.user.id,
        filters: { search, unidadeId, condominioId, status, prioridade, tipo }
      });

      res.json({
        success: true,
        data: {
          manutencoes,
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
      logger.error('Erro ao listar manutenções:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Criar nova manutenção
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
        unidadeId,
        tipo,
        titulo,
        descricao,
        prioridade,
        responsavelId,
        observacoes,
        itensInventario
      } = req.body;

      // Verificar se unidade existe
      const unidade = await Unidade.findByPk(unidadeId, {
        include: [
          {
            model: Condominio,
            as: 'condominio',
            attributes: ['id', 'nome']
          }
        ]
      });

      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      // Verificar se responsável existe (se fornecido)
      if (responsavelId) {
        const responsavel = await Usuario.findByPk(responsavelId);
        if (!responsavel) {
          return res.status(404).json({
            success: false,
            message: 'Responsável não encontrado'
          });
        }
      }

      // Gerar número da manutenção
      const anoAtual = new Date().getFullYear();
      const ultimaManutencao = await Manutencao.findOne({
        where: {
          numero: {
            [Op.like]: `${anoAtual}%`
          }
        },
        order: [['numero', 'DESC']]
      });

      let proximoNumero = 1;
      if (ultimaManutencao) {
        const ultimoNumero = parseInt(ultimaManutencao.numero.split('-')[1]);
        proximoNumero = ultimoNumero + 1;
      }

      const numero = `${anoAtual}-${proximoNumero.toString().padStart(6, '0')}`;

      // Processar arquivos anexados
      let anexos = [];
      if (req.files && req.files.length > 0) {
        anexos = req.files.map(file => ({
          nome: file.originalname,
          caminho: file.path,
          tipo: file.mimetype,
          tamanho: file.size
        }));
      }

      // Criar manutenção
      const manutencao = await Manutencao.create({
        numero,
        unidadeId,
        solicitanteId: req.user.id,
        responsavelId,
        tipo,
        titulo,
        descricao,
        prioridade: prioridade || 'MEDIA',
        status: 'ABERTA',
        dataAbertura: new Date(),
        observacoes,
        anexos: anexos.length > 0 ? JSON.stringify(anexos) : null
      });

      // Associar itens de inventário se fornecidos
      if (itensInventario && itensInventario.length > 0) {
        for (const item of itensInventario) {
          // Verificar se item existe
          const itemInventario = await Inventario.findByPk(item.inventarioId);
          if (itemInventario) {
            await ManutencaoInventario.create({
              manutencaoId: manutencao.id,
              inventarioId: item.inventarioId,
              quantidade: item.quantidade,
              observacoes: item.observacoes
            });

            // Atualizar estoque se necessário
            if (item.reduzirEstoque && itemInventario.quantidade >= item.quantidade) {
              await itemInventario.update({
                quantidade: itemInventario.quantidade - item.quantidade
              });
            }
          }
        }
      }

      // Buscar manutenção criada com relacionamentos
      const manutencaoCriada = await Manutencao.findByPk(manutencao.id, {
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'numero', 'bloco'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome']
              }
            ]
          },
          {
            model: Usuario,
            as: 'solicitante',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'responsavel',
            attributes: ['id', 'nome', 'email'],
            required: false
          }
        ]
      });

      logger.info(`Manutenção criada: ${manutencao.id}`, {
        userId: req.user.id,
        manutencaoId: manutencao.id,
        unidadeId,
        numero
      });

      res.status(201).json({
        success: true,
        message: 'Manutenção criada com sucesso',
        data: manutencaoCriada
      });

    } catch (error) {
      logger.error('Erro ao criar manutenção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar manutenção por ID
   */
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const manutencao = await Manutencao.findByPk(id, {
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'numero', 'bloco', 'tipo'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome', 'endereco', 'telefone']
              },
              {
                model: Usuario,
                as: 'proprietario',
                attributes: ['id', 'nome', 'email', 'telefone'],
                required: false
              }
            ]
          },
          {
            model: Usuario,
            as: 'solicitante',
            attributes: ['id', 'nome', 'email', 'telefone']
          },
          {
            model: Usuario,
            as: 'responsavel',
            attributes: ['id', 'nome', 'email', 'telefone'],
            required: false
          }
        ]
      });

      if (!manutencao) {
        return res.status(404).json({
          success: false,
          message: 'Manutenção não encontrada'
        });
      }

      // Buscar itens de inventário associados
      const itensInventario = await ManutencaoInventario.findAll({
        where: { manutencaoId: id },
        include: [
          {
            model: Inventario,
            as: 'item',
            attributes: ['id', 'nome', 'categoria', 'unidade', 'quantidade']
          }
        ]
      });

      logger.info(`Manutenção consultada: ${id}`, {
        userId: req.user.id,
        manutencaoId: id
      });

      res.json({
        success: true,
        data: {
          ...manutencao.toJSON(),
          itensInventario
        }
      });

    } catch (error) {
      logger.error('Erro ao buscar manutenção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar manutenção
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
        titulo,
        descricao,
        prioridade,
        status,
        responsavelId,
        observacoes,
        dataFinalizacao
      } = req.body;

      // Verificar se manutenção existe
      const manutencao = await Manutencao.findByPk(id);
      if (!manutencao) {
        return res.status(404).json({
          success: false,
          message: 'Manutenção não encontrada'
        });
      }

      // Verificar se responsável existe (se fornecido)
      if (responsavelId) {
        const responsavel = await Usuario.findByPk(responsavelId);
        if (!responsavel) {
          return res.status(404).json({
            success: false,
            message: 'Responsável não encontrado'
          });
        }
      }

      // Processar novos arquivos anexados
      let anexosAtuais = [];
      if (manutencao.anexos) {
        try {
          anexosAtuais = JSON.parse(manutencao.anexos);
        } catch (e) {
          anexosAtuais = [];
        }
      }

      if (req.files && req.files.length > 0) {
        const novosAnexos = req.files.map(file => ({
          nome: file.originalname,
          caminho: file.path,
          tipo: file.mimetype,
          tamanho: file.size,
          dataUpload: new Date()
        }));
        anexosAtuais = [...anexosAtuais, ...novosAnexos];
      }

      // Preparar dados para atualização
      const dadosAtualizacao = {
        titulo,
        descricao,
        prioridade,
        status,
        responsavelId,
        observacoes
      };

      // Se status mudou para FINALIZADA, adicionar data de finalização
      if (status === 'FINALIZADA' && manutencao.status !== 'FINALIZADA') {
        dadosAtualizacao.dataFinalizacao = dataFinalizacao || new Date();
      }

      // Se anexos foram adicionados
      if (anexosAtuais.length > 0) {
        dadosAtualizacao.anexos = JSON.stringify(anexosAtuais);
      }

      // Atualizar manutenção
      await manutencao.update(dadosAtualizacao);

      // Buscar manutenção atualizada com relacionamentos
      const manutencaoAtualizada = await Manutencao.findByPk(id, {
        include: [
          {
            model: Unidade,
            as: 'unidade',
            attributes: ['id', 'numero', 'bloco'],
            include: [
              {
                model: Condominio,
                as: 'condominio',
                attributes: ['id', 'nome']
              }
            ]
          },
          {
            model: Usuario,
            as: 'solicitante',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'responsavel',
            attributes: ['id', 'nome', 'email'],
            required: false
          }
        ]
      });

      logger.info(`Manutenção atualizada: ${id}`, {
        userId: req.user.id,
        manutencaoId: id,
        statusAnterior: manutencao.status,
        statusAtual: status
      });

      res.json({
        success: true,
        message: 'Manutenção atualizada com sucesso',
        data: manutencaoAtualizada
      });

    } catch (error) {
      logger.error('Erro ao atualizar manutenção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Excluir manutenção
   */
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const manutencao = await Manutencao.findByPk(id);
      if (!manutencao) {
        return res.status(404).json({
          success: false,
          message: 'Manutenção não encontrada'
        });
      }

      // Verificar se pode excluir (apenas se não estiver finalizada)
      if (manutencao.status === 'FINALIZADA') {
        return res.status(409).json({
          success: false,
          message: 'Não é possível excluir manutenção finalizada'
        });
      }

      // Remover arquivos anexados
      if (manutencao.anexos) {
        try {
          const anexos = JSON.parse(manutencao.anexos);
          for (const anexo of anexos) {
            if (fs.existsSync(anexo.caminho)) {
              fs.unlinkSync(anexo.caminho);
            }
          }
        } catch (e) {
          logger.warn('Erro ao remover anexos da manutenção:', e);
        }
      }

      // Remover associações com inventário
      await ManutencaoInventario.destroy({
        where: { manutencaoId: id }
      });

      await manutencao.destroy();

      logger.info(`Manutenção excluída: ${id}`, {
        userId: req.user.id,
        manutencaoId: id
      });

      res.json({
        success: true,
        message: 'Manutenção excluída com sucesso'
      });

    } catch (error) {
      logger.error('Erro ao excluir manutenção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Buscar manutenções por unidade
   */
  async buscarPorUnidade(req, res) {
    try {
      const { unidadeId } = req.params;
      const { status, limit = 10 } = req.query;

      // Verificar se unidade existe
      const unidade = await Unidade.findByPk(unidadeId);
      if (!unidade) {
        return res.status(404).json({
          success: false,
          message: 'Unidade não encontrada'
        });
      }

      const whereClause = { unidadeId };
      if (status) {
        whereClause.status = status;
      }

      const manutencoes = await Manutencao.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'solicitante',
            attributes: ['id', 'nome', 'email']
          },
          {
            model: Usuario,
            as: 'responsavel',
            attributes: ['id', 'nome', 'email'],
            required: false
          }
        ],
        order: [['dataAbertura', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: manutencoes
      });

    } catch (error) {
      logger.error('Erro ao buscar manutenções por unidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Atualizar status da manutenção
   */
  async atualizarStatus(req, res) {
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
      const { status, observacoes } = req.body;

      const manutencao = await Manutencao.findByPk(id);
      if (!manutencao) {
        return res.status(404).json({
          success: false,
          message: 'Manutenção não encontrada'
        });
      }

      const dadosAtualizacao = { status };

      // Se status mudou para FINALIZADA, adicionar data de finalização
      if (status === 'FINALIZADA' && manutencao.status !== 'FINALIZADA') {
        dadosAtualizacao.dataFinalizacao = new Date();
      }

      // Adicionar observações se fornecidas
      if (observacoes) {
        const observacoesAtuais = manutencao.observacoes || '';
        const novaObservacao = `\n[${new Date().toLocaleDateString('pt-BR')} - ${req.user.nome}]: ${observacoes}`;
        dadosAtualizacao.observacoes = observacoesAtuais + novaObservacao;
      }

      await manutencao.update(dadosAtualizacao);

      logger.info(`Status da manutenção atualizado: ${id}`, {
        userId: req.user.id,
        manutencaoId: id,
        statusAnterior: manutencao.status,
        statusAtual: status
      });

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: {
          id: manutencao.id,
          status: status,
          dataFinalizacao: dadosAtualizacao.dataFinalizacao
        }
      });

    } catch (error) {
      logger.error('Erro ao atualizar status da manutenção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  /**
   * Download de anexo
   */
  async downloadAnexo(req, res) {
    try {
      const { id, anexoId } = req.params;

      const manutencao = await Manutencao.findByPk(id);
      if (!manutencao) {
        return res.status(404).json({
          success: false,
          message: 'Manutenção não encontrada'
        });
      }

      if (!manutencao.anexos) {
        return res.status(404).json({
          success: false,
          message: 'Nenhum anexo encontrado'
        });
      }

      const anexos = JSON.parse(manutencao.anexos);
      const anexo = anexos[parseInt(anexoId)];

      if (!anexo) {
        return res.status(404).json({
          success: false,
          message: 'Anexo não encontrado'
        });
      }

      if (!fs.existsSync(anexo.caminho)) {
        return res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado no servidor'
        });
      }

      res.download(anexo.caminho, anexo.nome);

    } catch (error) {
      logger.error('Erro ao fazer download do anexo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = manutencaoController;