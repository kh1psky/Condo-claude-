// backend/src/controllers/usuarioController.js
const { Usuario, Unidade } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Lista todos os usuários com paginação e filtros
 * @route GET /api/v1/usuarios
 */
exports.listarUsuarios = async (req, res, next) => {
  try {
    const {
      pagina = 1,
      limite = 10,
      busca = '',
      tipo,
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
          { email: { [Op.like]: `%${busca}%` } },
          { cpf: { [Op.like]: `%${busca}%` } }
        ]
      };
    }
    
    if (tipo) {
      options.where.tipo = tipo;
    }
    
    if (status) {
      options.where.status = status;
    }
    
    // Executar a consulta paginada
    const { rows: usuarios, count } = await Usuario.findAndCountAll({
      ...options,
      offset: (parseInt(pagina, 10) - 1) * parseInt(limite, 10),
      limit: parseInt(limite, 10),
      attributes: { exclude: ['senha', 'token_reset_senha', 'expiracao_token_reset'] }
    });
    
    return res.json({
      usuarios,
      meta: {
        total: count,
        pagina: parseInt(pagina, 10),
        limite: parseInt(limite, 10),
        paginas: Math.ceil(count / parseInt(limite, 10))
      }
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    next(error);
  }
};

/**
 * Busca um usuário pelo ID
 * @route GET /api/v1/usuarios/:id
 */
exports.buscarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: Unidade,
          as: 'unidades'
        }
      ],
      attributes: { exclude: ['senha', 'token_reset_senha', 'expiracao_token_reset'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    return res.json(usuario);
  } catch (error) {
    logger.error(`Erro ao buscar usuário ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Cria um novo usuário
 * @route POST /api/v1/usuarios
 */
exports.criarUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha, cpf, telefone, tipo } = req.body;
    
    // Verificar se email já existe
    const existingEmail = await Usuario.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    
    // Verificar se CPF já existe
    const existingCPF = await Usuario.findOne({ where: { cpf } });
    if (existingCPF) {
      return res.status(409).json({ error: 'CPF já cadastrado' });
    }
    
    // Criar o usuário
    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      cpf,
      telefone,
      tipo: tipo || 'morador'
    });
    
    // Remover a senha do objeto de resposta
    const usuarioJSON = usuario.toJSON();
    delete usuarioJSON.senha;
    
    logger.info(`Usuário criado: ${email}`);
    
    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioJSON
    });
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    next(error);
  }
};

/**
 * Atualiza um usuário
 * @route PUT /api/v1/usuarios/:id
 */
exports.atualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, telefone, tipo, status } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se o email está sendo alterado e se já existe
    if (email && email !== usuario.email) {
      const existingEmail = await Usuario.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email já cadastrado' });
      }
    }
    
    // Atualizar o usuário
    const camposAtualizados = {};
    
    if (nome) camposAtualizados.nome = nome;
    if (email) camposAtualizados.email = email;
    if (senha) camposAtualizados.senha = senha;
    if (telefone) camposAtualizados.telefone = telefone;
    if (tipo) camposAtualizados.tipo = tipo;
    if (status) camposAtualizados.status = status;
    
    await usuario.update(camposAtualizados);
    
    // Buscar o usuário atualizado
    const usuarioAtualizado = await Usuario.findByPk(id, {
      attributes: { exclude: ['senha', 'token_reset_senha', 'expiracao_token_reset'] }
    });
    
    logger.info(`Usuário atualizado: ${id}`);
    
    return res.json({
      message: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado
    });
  } catch (error) {
    logger.error(`Erro ao atualizar usuário ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove um usuário (soft delete)
 * @route DELETE /api/v1/usuarios/:id
 */
exports.removerUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se o usuário possui unidades
    const temUnidades = await Unidade.findOne({ where: { usuario_id: id } });
    
    if (temUnidades) {
      return res.status(409).json({
        error: 'Não é possível remover o usuário pois existem unidades associadas a ele'
      });
    }
    
    // Remover o usuário (soft delete)
    await usuario.destroy();
    
    logger.info(`Usuário removido: ${id}`);
    
    return res.json({
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao remover usuário ID ${req.params.id}:`, error);
    next(error);
  }
};