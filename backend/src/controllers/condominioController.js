// backend/src/controllers/condominioController.js
const { Condominio, Unidade, Usuario } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Lista todos os condomínios com paginação e filtros
 * @route GET /api/v1/condominios
 */
exports.listarCondominios = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 10,
      busca = '',
      status
    } = req.query;
    
    // Configurar opções de paginação
    const options = {
      page: parseInt(pagina, 10),
      paginate: parseInt(limite, 10),
      order: [['nome', 'ASC']],
      where: {}
    };
    
    // Adicionar filtros
    if (busca) {
      options.where = {
        ...options.where,
        [Op.or]: [
          { nome: { [Op.like]: `%${busca}%` } },
          { cnpj: { [Op.like]: `%${busca}%` } },
          { endereco: { [Op.like]: `%${busca}%` } },
          { cidade: { [Op.like]: `%${busca}%` } }
        ]
      };
    }
    
    if (status) {
      options.where.status = status;
    }
    
    // Executar a consulta paginada
    const { rows: condominios, count } = await Condominio.findAndCountAll({
      ...options,
      offset: (parseInt(pagina, 10) - 1) * parseInt(limite, 10),
      limit: parseInt(limite, 10)
    });
    
    return res.json({
      condominios,
      meta: {
        total: count,
        pagina: parseInt(pagina, 10),
        limite: parseInt(limite, 10),
        paginas: Math.ceil(count / parseInt(limite, 10))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar condomínios:', error);
    next(error);
  }
};

/**
 * Busca um condomínio pelo ID
 * @route GET /api/v1/condominios/:id
 */
exports.buscarCondominio = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const condominio = await Condominio.findByPk(id, {
      include: [
        {
          model: Unidade,
          as: 'unidades',
          include: [
            {
              model: Usuario,
              as: 'proprietario',
              attributes: ['id', 'nome', 'email', 'telefone']
            }
          ]
        }
      ]
    });
    
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    return res.json(condominio);
  } catch (error) {
    logger.error(`Erro ao buscar condomínio ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Cria um novo condomínio
 * @route POST /api/v1/condominios
 */
exports.criarCondominio = async (req, res, next) => {
  try {
    const {
      nome,
      endereco,
      cidade,
      estado,
      cep,
      cnpj,
      email_contato,
      telefone_contato,
      data_inauguracao
    } = req.body;
    
    // Verificar se CNPJ já existe
    const existingCNPJ = await Condominio.findOne({ where: { cnpj } });
    if (existingCNPJ) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }
    
    // Criar o condomínio
    const condominio = await Condominio.create({
      nome,
      endereco,
      cidade,
      estado,
      cep,
      cnpj,
      email_contato,
      telefone_contato,
      data_inauguracao
    });
    
    logger.info(`Condomínio criado: ${nome}`);
    
    return res.status(201).json({
      message: 'Condomínio criado com sucesso',
      condominio
    });
  } catch (error) {
    logger.error('Erro ao criar condomínio:', error);
    next(error);
  }
};

/**
 * Atualiza um condomínio
 * @route PUT /api/v1/condominios/:id
 */
exports.atualizarCondominio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nome,
      endereco,
      cidade,
      estado,
      cep,
      cnpj,
      email_contato,
      telefone_contato,
      data_inauguracao,
      status
    } = req.body;
    
    const condominio = await Condominio.findByPk(id);
    
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Verificar se o CNPJ está sendo alterado e se já existe
    if (cnpj && cnpj !== condominio.cnpj) {
      const existingCNPJ = await Condominio.findOne({ where: { cnpj } });
      if (existingCNPJ) {
        return res.status(409).json({ error: 'CNPJ já cadastrado' });
      }
    }
    
    // Atualizar o condomínio
    const camposAtualizados = {};
    
    if (nome) camposAtualizados.nome = nome;
    if (endereco) camposAtualizados.endereco = endereco;
    if (cidade) camposAtualizados.cidade = cidade;
    if (estado) camposAtualizados.estado = estado;
    if (cep) camposAtualizados.cep = cep;
    if (cnpj) camposAtualizados.cnpj = cnpj;
    if (email_contato) camposAtualizados.email_contato = email_contato;
    if (telefone_contato) camposAtualizados.telefone_contato = telefone_contato;
    if (data_inauguracao) camposAtualizados.data_inauguracao = data_inauguracao;
    if (status) camposAtualizados.status = status;
    
    await condominio.update(camposAtualizados);
    
    logger.info(`Condomínio atualizado: ${id}`);
    
    return res.json({
      message: 'Condomínio atualizado com sucesso',
      condominio
    });
  } catch (error) {
    logger.error(`Erro ao atualizar condomínio ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove um condomínio (soft delete)
 * @route DELETE /api/v1/condominios/:id
 */
exports.removerCondominio = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const condominio = await Condominio.findByPk(id);
    
    if (!condominio) {
      return res.status(404).json({ error: 'Condomínio não encontrado' });
    }
    
    // Verificar se o condomínio possui unidades
    const temUnidades = await Unidade.findOne({ where: { condominio_id: id } });
    
    if (temUnidades) {
      return res.status(409).json({
        error: 'Não é possível remover o condomínio pois existem unidades associadas a ele'
      });
    }
    
    // Remover o condomínio (soft delete)
    await condominio.destroy();
    
    logger.info(`Condomínio removido: ${id}`);
    
    return res.json({
      message: 'Condomínio removido com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao remover condomínio ID ${req.params.id}:`, error);
    next(error);
  }
};