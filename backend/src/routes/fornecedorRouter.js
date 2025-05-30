const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

/**
 * Validações para criação de fornecedor
 */
const validarCriacaoFornecedor = [
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('cnpj')
    .optional()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
    .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  body('celular')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)
    .withMessage('Celular deve estar no formato (XX) XXXXX-XXXX'),
  
  body('endereco')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres'),
  
  body('complemento')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Complemento deve ter no máximo 100 caracteres'),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('uf')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('UF deve ter 2 caracteres')
    .toUpperCase(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato XXXXX-XXX'),
  
  body('tipo')
    .optional()
    .isIn(['SERVICOS', 'MANUTENCAO', 'LIMPEZA', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'CONSULTORIA', 'OUTROS'])
    .withMessage('Tipo deve ser válido'),
  
  body('responsavel')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Responsável deve ter no máximo 100 caracteres'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
];

/**
 * Validações para atualização de fornecedor
 */
const validarAtualizacaoFornecedor = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor deve ser um número válido'),
  
  body('nome')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('cnpj')
    .optional()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)
    .withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('telefone')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  body('celular')
    .optional()
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)
    .withMessage('Celular deve estar no formato (XX) XXXXX-XXXX'),
  
  body('endereco')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Endereço deve ter no máximo 200 caracteres'),
  
  body('numero')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Número deve ter no máximo 20 caracteres'),
  
  body('complemento')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Complemento deve ter no máximo 100 caracteres'),
  
  body('bairro')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bairro deve ter no máximo 100 caracteres'),
  
  body('cidade')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  
  body('uf')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('UF deve ter 2 caracteres')
    .toUpperCase(),
  
  body('cep')
    .optional()
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP deve estar no formato XXXXX-XXX'),
  
  body('tipo')
    .optional()
    .isIn(['SERVICOS', 'MANUTENCAO', 'LIMPEZA', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'CONSULTORIA', 'OUTROS'])
    .withMessage('Tipo deve ser válido'),
  
  body('responsavel')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Responsável deve ter no máximo 100 caracteres'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres'),
  
  body('status')
    .optional()
    .isIn(['ATIVO', 'INATIVO'])
    .withMessage('Status deve ser ATIVO ou INATIVO')
];

/**
 * Validações para listagem
 */
const validarListagem = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número maior que 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),
  
  query('tipo')
    .optional()
    .isIn(['SERVICOS', 'MANUTENCAO', 'LIMPEZA', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'CONSULTORIA', 'OUTROS'])
    .withMessage('Tipo deve ser válido'),
  
  query('status')
    .optional()
    .isIn(['ATIVO', 'INATIVO'])
    .withMessage('Status deve ser ATIVO ou INATIVO'),
  
  query('uf')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('UF deve ter 2 caracteres')
    .toUpperCase()
];

/**
 * Validações para alteração de status
 */
const validarAlteracaoStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor deve ser um número válido'),
  
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['ATIVO', 'INATIVO'])
    .withMessage('Status deve ser ATIVO ou INATIVO')
];

/**
 * Validações para parâmetros
 */
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

const validarTipo = [
  param('tipo')
    .isIn(['SERVICOS', 'MANUTENCAO', 'LIMPEZA', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'CONSULTORIA', 'OUTROS'])
    .withMessage('Tipo deve ser válido')
];

// ===== ROTAS PRINCIPAIS =====

/**
 * @swagger
 * /api/v1/fornecedores:
 *   get:
 *     summary: Listar fornecedores
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome, CNPJ, email ou observações
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [SERVICOS, MANUTENCAO, LIMPEZA, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, CONSULTORIA, OUTROS]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, INATIVO]
 *         description: Filtrar por status
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *       - in: query
 *         name: uf
 *         schema:
 *           type: string
 *         description: Filtrar por UF
 *     responses:
 *       200:
 *         description: Lista de fornecedores
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.get('/', authMiddleware, validarListagem, fornecedorController.listar);

/**
 * @swagger
 * /api/v1/fornecedores:
 *   post:
 *     summary: Criar novo fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               celular:
 *                 type: string
 *               endereco:
 *                 type: string
 *               numero:
 *                 type: string
 *               complemento:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               uf:
 *                 type: string
 *               cep:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SERVICOS, MANUTENCAO, LIMPEZA, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, CONSULTORIA, OUTROS]
 *               responsavel:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fornecedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       409:
 *         description: CNPJ ou email já cadastrado
 */
router.post('/', authMiddleware, isAdmin, validarCriacaoFornecedor, fornecedorController.criar);

/**
 * @swagger
 * /api/v1/fornecedores/{id}:
 *   get:
 *     summary: Buscar fornecedor por ID
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Dados do fornecedor
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get('/:id', authMiddleware, validarId, fornecedorController.buscarPorId);

/**
 * @swagger
 * /api/v1/fornecedores/{id}:
 *   put:
 *     summary: Atualizar fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               celular:
 *                 type: string
 *               endereco:
 *                 type: string
 *               numero:
 *                 type: string
 *               complemento:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cidade:
 *                 type: string
 *               uf:
 *                 type: string
 *               cep:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SERVICOS, MANUTENCAO, LIMPEZA, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, CONSULTORIA, OUTROS]
 *               responsavel:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 *       409:
 *         description: CNPJ ou email já cadastrado
 */
router.put('/:id', authMiddleware, isAdmin, validarAtualizacaoFornecedor, fornecedorController.atualizar);

/**
 * @swagger
 * /api/v1/fornecedores/{id}:
 *   delete:
 *     summary: Excluir fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
 *     responses:
 *       200:
 *         description: Fornecedor excluído com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Fornecedor não encontrado
 *       409:
 *         description: Fornecedor possui dependências
 */
router.delete('/:id', authMiddleware, isAdmin, validarId, fornecedorController.excluir);

// ===== ROTAS ESPECÍFICAS =====

/**
 * @swagger
 * /api/v1/fornecedores/tipos:
 *   get:
 *     summary: Listar tipos de fornecedores disponíveis
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos disponíveis
 *       401:
 *         description: Token inválido
 */
router.get('/tipos', authMiddleware, fornecedorController.listarTipos);

/**
 * @swagger
 * /api/v1/fornecedores/tipo/{tipo}:
 *   get:
 *     summary: Buscar fornecedores por tipo
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SERVICOS, MANUTENCAO, LIMPEZA, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, CONSULTORIA, OUTROS]
 *         description: Tipo do fornecedor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, INATIVO]
 *           default: ATIVO
 *         description: Status dos fornecedores
 *     responses:
 *       200:
 *         description: Lista de fornecedores do tipo especificado
 *       401:
 *         description: Token inválido
 */
router.get('/tipo/:tipo', authMiddleware, validarTipo, fornecedorController.buscarPorTipo);

/**
 * @swagger
 * /api/v1/fornecedores/{id}/status:
 *   patch:
 *     summary: Alterar status do fornecedor
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Fornecedor não encontrado
 */
router.patch('/:id/status', authMiddleware, isAdmin, validarAlteracaoStatus, fornecedorController.alterarStatus);

module.exports = router;