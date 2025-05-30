const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

/**
 * Validações para criação de contrato
 */
const validarCriacaoContrato = [
  body('fornecedorId')
    .notEmpty()
    .withMessage('ID do fornecedor é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor deve ser um número válido'),
  
  body('condominioId')
    .notEmpty()
    .withMessage('ID do condomínio é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  body('objeto')
    .notEmpty()
    .withMessage('Objeto do contrato é obrigatório')
    .isLength({ min: 5, max: 200 })
    .withMessage('Objeto deve ter entre 5 e 200 caracteres'),
  
  body('descricao')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['SERVICO', 'MANUTENCAO', 'FORNECIMENTO', 'PRESTACAO', 'LOCACAO', 'OUTROS'])
    .withMessage('Tipo deve ser: SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO ou OUTROS'),
  
  body('valor')
    .notEmpty()
    .withMessage('Valor é obrigatório')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor deve ser um número decimal válido'),
  
  body('dataInicio')
    .notEmpty()
    .withMessage('Data de início é obrigatória')
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),
  
  body('dataFim')
    .notEmpty()
    .withMessage('Data de fim é obrigatória')
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.dataInicio)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    }),
  
  body('clausulas')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Cláusulas deve ter no máximo 5000 caracteres'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
];

/**
 * Validações para atualização de contrato
 */
const validarAtualizacaoContrato = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do contrato deve ser um número válido'),
  
  body('objeto')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Objeto deve ter entre 5 e 200 caracteres'),
  
  body('descricao')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['SERVICO', 'MANUTENCAO', 'FORNECIMENTO', 'PRESTACAO', 'LOCACAO', 'OUTROS'])
    .withMessage('Tipo deve ser: SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO ou OUTROS'),
  
  body('valor')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor deve ser um número decimal válido'),
  
  body('dataInicio')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),
  
  body('dataFim')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida'),
  
  body('clausulas')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Cláusulas deve ter no máximo 5000 caracteres'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres'),
  
  body('status')
    .optional()
    .isIn(['ATIVO', 'SUSPENSO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Status deve ser: ATIVO, SUSPENSO, FINALIZADO ou CANCELADO')
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
  
  query('fornecedorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor deve ser um número válido'),
  
  query('condominioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  query('status')
    .optional()
    .isIn(['ATIVO', 'SUSPENSO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Status deve ser: ATIVO, SUSPENSO, FINALIZADO ou CANCELADO'),
  
  query('tipo')
    .optional()
    .isIn(['SERVICO', 'MANUTENCAO', 'FORNECIMENTO', 'PRESTACAO', 'LOCACAO', 'OUTROS'])
    .withMessage('Tipo deve ser: SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO ou OUTROS'),
  
  query('dataInicio')
    .optional()
    .isISO8601()
    .withMessage('Data início deve ser uma data válida'),
  
  query('dataFim')
    .optional()
    .isISO8601()
    .withMessage('Data fim deve ser uma data válida'),
  
  query('vencendoEm')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Vencendo em deve ser um número entre 1 e 365 dias')
];

/**
 * Validações para renovação de contrato
 */
const validarRenovacao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do contrato deve ser um número válido'),
  
  body('novaDataFim')
    .notEmpty()
    .withMessage('Nova data de fim é obrigatória')
    .isISO8601()
    .withMessage('Nova data de fim deve ser uma data válida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Nova data de fim deve ser futura');
      }
      return true;
    }),
  
  body('novoValor')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Novo valor deve ser um número decimal válido'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
];

/**
 * Validações para parâmetros
 */
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

const validarFornecedorId = [
  param('fornecedorId')
    .isInt({ min: 1 })
    .withMessage('ID do fornecedor deve ser um número válido')
];

const validarContratosVencendo = [
  query('dias')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Dias deve ser um número entre 1 e 365')
];

// ===== ROTAS PRINCIPAIS =====

/**
 * @swagger
 * /api/v1/contratos:
 *   get:
 *     summary: Listar contratos
 *     tags: [Contratos]
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
 *         description: Busca por objeto, descrição ou observações
 *       - in: query
 *         name: fornecedorId
 *         schema:
 *           type: integer
 *         description: Filtrar por fornecedor
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, SUSPENSO, FINALIZADO, CANCELADO]
 *         description: Filtrar por status
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO, OUTROS]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data início do período
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data fim do período
 *       - in: query
 *         name: vencendoEm
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *         description: Contratos vencendo em X dias
 *     responses:
 *       200:
 *         description: Lista de contratos
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.get('/', authMiddleware, validarListagem, contratoController.listar);

/**
 * @swagger
 * /api/v1/contratos:
 *   post:
 *     summary: Criar novo contrato
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fornecedorId
 *               - condominioId
 *               - objeto
 *               - descricao
 *               - valor
 *               - dataInicio
 *               - dataFim
 *             properties:
 *               fornecedorId:
 *                 type: integer
 *               condominioId:
 *                 type: integer
 *               objeto:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO, OUTROS]
 *               valor:
 *                 type: number
 *               dataInicio:
 *                 type: string
 *                 format: date
 *               dataFim:
 *                 type: string
 *                 format: date
 *               clausulas:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contrato criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor ou condomínio não encontrado
 */
router.post('/', authMiddleware, isAdmin, validarCriacaoContrato, contratoController.criar);

/**
 * @swagger
 * /api/v1/contratos/{id}:
 *   get:
 *     summary: Buscar contrato por ID
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato
 *     responses:
 *       200:
 *         description: Dados do contrato
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Contrato não encontrado
 */
router.get('/:id', authMiddleware, validarId, contratoController.buscarPorId);

/**
 * @swagger
 * /api/v1/contratos/{id}:
 *   put:
 *     summary: Atualizar contrato
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objeto:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SERVICO, MANUTENCAO, FORNECIMENTO, PRESTACAO, LOCACAO, OUTROS]
 *               valor:
 *                 type: number
 *               dataInicio:
 *                 type: string
 *                 format: date
 *               dataFim:
 *                 type: string
 *                 format: date
 *               clausulas:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ATIVO, SUSPENSO, FINALIZADO, CANCELADO]
 *     responses:
 *       200:
 *         description: Contrato atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Contrato não encontrado
 */
router.put('/:id', authMiddleware, isAdmin, validarAtualizacaoContrato, contratoController.atualizar);

/**
 * @swagger
 * /api/v1/contratos/{id}:
 *   delete:
 *     summary: Excluir contrato
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato
 *     responses:
 *       200:
 *         description: Contrato excluído com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Contrato não encontrado
 *       409:
 *         description: Contrato não pode ser excluído
 */
router.delete('/:id', authMiddleware, isAdmin, validarId, contratoController.excluir);

// ===== ROTAS ESPECÍFICAS =====

/**
 * @swagger
 * /api/v1/contratos/fornecedor/{fornecedorId}:
 *   get:
 *     summary: Buscar contratos por fornecedor
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fornecedorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do fornecedor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, SUSPENSO, FINALIZADO, CANCELADO]
 *         description: Filtrar por status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista de contratos do fornecedor
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get('/fornecedor/:fornecedorId', authMiddleware, validarFornecedorId, contratoController.buscarPorFornecedor);

/**
 * @swagger
 * /api/v1/contratos/vencendo:
 *   get:
 *     summary: Buscar contratos vencendo
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Dias para vencimento
 *     responses:
 *       200:
 *         description: Lista de contratos vencendo
 *       401:
 *         description: Token inválido
 */
router.get('/vencendo', authMiddleware, validarContratosVencendo, contratoController.contratosVencendo);

/**
 * @swagger
 * /api/v1/contratos/{id}/renovar:
 *   post:
 *     summary: Renovar contrato
 *     tags: [Contratos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - novaDataFim
 *             properties:
 *               novaDataFim:
 *                 type: string
 *                 format: date
 *               novoValor:
 *                 type: number
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contrato renovado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Contrato não encontrado
 */
router.post('/:id/renovar', authMiddleware, isAdmin, validarRenovacao, contratoController.renovar);

module.exports = router;