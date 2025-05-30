// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Registra um novo usuário
 * @route POST /api/v1/auth/register
 */
exports.register = async (req, res, next) => {
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
      senha, // Hash é feito automaticamente pelo hook beforeSave do modelo
      cpf,
      telefone,
      tipo: tipo || 'morador' // Default para 'morador' se não especificado
    });
    
    // Remover a senha do objeto de resposta
    const usuarioJSON = usuario.toJSON();
    delete usuarioJSON.senha;
    
    logger.info(`Novo usuário registrado: ${email}`);
    
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      usuario: usuarioJSON
    });
  } catch (error) {
    logger.error('Erro ao registrar usuário:', error);
    next(error);
  }
};

/**
 * Autentica um usuário e retorna um token JWT
 * @route POST /api/v1/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    
    // Buscar o usuário pelo email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar se o usuário está ativo
    if (usuario.status === 'inativo') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }
    
    // Verificar a senha
    const senhaCorreta = await usuario.checkSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar o token JWT
    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    
    // Atualizar a data do último login
    await usuario.update({ ultimo_login: new Date() });
    
    // Remover a senha do objeto de resposta
    const usuarioJSON = usuario.toJSON();
    delete usuarioJSON.senha;
    
    logger.info(`Usuário autenticado: ${email}`);
    
    return res.json({
      usuario: usuarioJSON,
      token
    });
  } catch (error) {
    logger.error('Erro ao autenticar usuário:', error);
    next(error);
  }
};

/**
 * Solicita redefinição de senha
 * @route POST /api/v1/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Buscar o usuário pelo email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      // Por segurança, não informamos se o email existe ou não
      return res.json({ message: 'Se o email estiver cadastrado, enviaremos instruções para redefinir a senha' });
    }
    
    // Gerar token para redefinição de senha (aleatório)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1); // Token válido por 1 hora
    
    // Salvar o token no usuário
    await usuario.update({
      token_reset_senha: token,
      expiracao_token_reset: expiraEm
    });
    
    // Aqui seria implementado o envio de email com o link para redefinição
    // Por enquanto, apenas logamos o token
    logger.info(`Token para redefinição de senha gerado para ${email}: ${token}`);
    
    return res.json({ message: 'Se o email estiver cadastrado, enviaremos instruções para redefinir a senha' });
  } catch (error) {
    logger.error('Erro ao solicitar redefinição de senha:', error);
    next(error);
  }
};

/**
 * Redefine a senha usando o token
 * @route POST /api/v1/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, senha } = req.body;
    
    // Buscar o usuário pelo token
    const usuario = await Usuario.findOne({
      where: {
        token_reset_senha: token,
        expiracao_token_reset: { [Op.gt]: new Date() } // Token não expirado
      }
    });
    
    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }
    
    // Atualizar a senha e limpar o token
    await usuario.update({
      senha, // Hash é feito automaticamente pelo hook beforeSave do modelo
      token_reset_senha: null,
      expiracao_token_reset: null
    });
    
    logger.info(`Senha redefinida para o usuário: ${usuario.email}`);
    
    return res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    logger.error('Erro ao redefinir senha:', error);
    next(error);
  }
};

/**
 * Retorna o usuário autenticado
 * @route GET /api/v1/auth/me
 */
exports.me = async (req, res, next) => {
  try {
    // Obter o usuário completo do banco de dados (com relações)
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [
        {
          model: Unidade,
          as: 'unidades'
        }
      ]
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Remover a senha do objeto de resposta
    const usuarioJSON = usuario.toJSON();
    delete usuarioJSON.senha;
    
    return res.json(usuarioJSON);
  } catch (error) {
    logger.error('Erro ao obter usuário autenticado:', error);
    next(error);
  }
};
