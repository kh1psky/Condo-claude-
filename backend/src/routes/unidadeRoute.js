const express = require('express');
const router = express.Router();
const unidadeController = require('../controllers/unidadeController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

/**
 * Validações para criação de unidade
 */
const validarCriacaoUnidade = [
  body('condominioId')
    .notEmpty()
    .withMessage('ID do condomínio é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  body('numero')
    .notEmpty()
    .withMessage('Número da unidade é obrigatório')
    .isLength({ min: 1, max: 20 })
    .withMessage('Número deve ter entre 1 e 20 caracteres'),
  
  body('bloco')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Bloco deve ter no máximo 10 caracteres'),
  
  body('andar')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Andar deve ser um número entre 0 e 200'),
  
  body('tipo')
    .optional()
    .isIn(['APARTAMENTO', 'CASA', 'LOJA', 'SALA', 'GARAGEM', 'DEPOSITO'])
    .withMessage('Tipo deve ser: APARTAMENTO, CASA, LOJA, SALA, GARAGEM ou DEPOSITO'),
  
  body('area')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Área deve ser um número decimal válido'),
  
  body('quartos')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Quartos deve ser um número entre 0 e 20'),
  
  body('banheiros')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Banheiros deve ser um número entre 0 e 20'),
  
  body('vagas')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Vagas deve ser um número entre 0 e 20'),
  
  body('valorIptu')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor IPTU deve ser um número decimal válido'),
  
  body('valorCondominio')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor condomínio deve ser um número decimal válido'),
  
  body('proprietarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do proprietário deve ser um número válido'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres')
];

/**
 * Validações para atualização de unidade
 */
const validarAtualizacaoUnidade = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da unidade deve ser um número válido'),
  
  body('numero')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Número deve ter entre 1 e 20 caracteres'),
  
  body('bloco')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Bloco deve ter no máximo 10 caracteres'),
  
  body('andar')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Andar deve ser um número entre 0 e 200'),
  
  body('tipo')
    .optional()
    .isIn(['APARTAMENTO', 'CASA', 'LOJA', 'SALA', 'GARAGEM', 'DEPOSITO'])
    .withMessage('Tipo deve ser: APARTAMENTO, CASA, LOJA, SALA, GARAGEM ou DEPOSITO'),
  
  body('area')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Área deve ser um número decimal válido'),
  
  body('quartos')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Quartos deve ser um número entre 0 e 20'),
  
  body('banheiros')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Banheiros deve ser um número entre 0 e 20'),
  
  body('vagas')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Vagas deve ser um número entre 0 e 20'),
  
  body('valorIptu')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor IPTU deve ser um número decimal válido'),
  
  body('valorCondominio')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor condomínio deve ser um número decimal válido'),
  
  body('proprietarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do proprietário deve ser um número válido'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres'),
  
  body('status')
    .optional()
    .isIn(['ATIVA', 'INATIVA', 'VENDIDA', 'ALUGADA'])
    .withMessage('Status deve ser: ATIVA, INATIVA, VENDIDA ou ALUGADA')
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
  
  query('condominioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  query('status')
    .optional()
    .isIn(['ATIVA', 'INATIVA', 'VENDIDA', 'ALUGADA'])
    .withMessage('Status deve ser: ATIVA, INATIVA, VENDIDA ou ALUGADA'),
  
  query('tipo')
    .optional()
    .isIn(['APARTAMENTO', 'CASA', 'LOJA', 'SALA', 'GARAGEM', 'DEPOSITO'])
    .withMessage('Tipo deve ser: APARTAMENTO, CASA, LOJA, SALA, GARAGEM ou DEPOSITO'),
  
  query('proprietarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do proprietário deve ser um número válido')
];

/**
 * Validações para associar proprietário
 */
const validarAssociacaoProprietario = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da unidade deve ser um número válido'),
  
  body('proprietarioId')
    .notEmpty()
    .withMessage('ID do proprietário é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do proprietário deve ser um número válido')
];

/**
 * Validações para parâmetros ID
 */
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

const validarCondominioId = [
  param('condominioId')
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido')
];

// ===== ROTAS PÚBLICAS (com autenticação) =====

/**
 * @swagger
 * /api/v1/unidades:
 *   get:
 *     summary: Listar unidades
 *     tags: [Unidades]
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
 *         description: Busca por número, bloco ou observações
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVA, INATIVA, VENDIDA, ALUGADA]
 *         description: Filtrar por status
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [APARTAMENTO, CASA, LOJA, SALA, GARAGEM, DEPOSITO]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: proprietarioId
 *         schema:
 *           type: integer
 *         description: Filtrar por proprietário
 *     responses:
 *       200:
 *         description: Lista de unidades
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.get('/', authMiddleware, validarListagem, unidadeController.listar);

/**
 * @swagger
 * /api/v1/unidades:
 *   post:
 *     summary: Criar nova unidade
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - condominioId
 *               - numero
 *             properties:
 *               condominioId:
 *                 type: integer
 *               numero:
 *                 type: string
 *               bloco:
 *                 type: string
 *               andar:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [APARTAMENTO, CASA, LOJA, SALA, GARAGEM, DEPOSITO]
 *               area:
 *                 type: number
 *               quartos:
 *                 type: integer
 *               banheiros:
 *                 type: integer
 *               vagas:
 *                 type: integer
 *               valorIptu:
 *                 type: number
 *               valorCondominio:
 *                 type: number
 *               proprietarioId:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Condomínio ou proprietário não encontrado
 *       409:
 *         description: Unidade já existe
 */
router.post('/', authMiddleware, isAdmin, validarCriacaoUnidade, unidadeController.criar);

/**
 * @swagger
 * /api/v1/unidades/{id}:
 *   get:
 *     summary: Buscar unidade por ID
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Dados da unidade
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/:id', authMiddleware, validarId, unidadeController.buscarPorId);

/**
 * @swagger
 * /api/v1/unidades/{id}:
 *   put:
 *     summary: Atualizar unidade
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *               bloco:
 *                 type: string
 *               andar:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [APARTAMENTO, CASA, LOJA, SALA, GARAGEM, DEPOSITO]
 *               area:
 *                 type: number
 *               quartos:
 *                 type: integer
 *               banheiros:
 *                 type: integer
 *               vagas:
 *                 type: integer
 *               valorIptu:
 *                 type: number
 *               valorCondominio:
 *                 type: number
 *               proprietarioId:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ATIVA, INATIVA, VENDIDA, ALUGADA]
 *     responses:
 *       200:
 *         description: Unidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Unidade não encontrada
 *       409:
 *         description: Conflito com unidade existente
 */
router.put('/:id', authMiddleware, isAdmin, validarAtualizacaoUnidade, unidadeController.atualizar);

/**
 * @swagger
 * /api/v1/unidades/{id}:
 *   delete:
 *     summary: Excluir unidade
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Unidade excluída com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Unidade não encontrada
 *       409:
 *         description: Unidade possui dependências
 */
router.delete('/:id', authMiddleware, isAdmin, validarId, unidadeController.excluir);

// ===== ROTAS ESPECÍFICAS =====

/**
 * @swagger
 * /api/v1/unidades/condominio/{condominioId}:
 *   get:
 *     summary: Listar unidades por condomínio
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: condominioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condomínio
 *       - in: query
 *         name: incluirProprietario
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir dados do proprietário
 *     responses:
 *       200:
 *         description: Lista de unidades do condomínio
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/condominio/:condominioId', authMiddleware, validarCondominioId, unidadeController.listarPorCondominio);

/**
 * @swagger
 * /api/v1/unidades/{id}/proprietario:
 *   post:
 *     summary: Associar proprietário à unidade
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proprietarioId
 *             properties:
 *               proprietarioId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Proprietário associado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Unidade ou proprietário não encontrado
 */
router.post('/:id/proprietario', authMiddleware, isAdmin, validarAssociacaoProprietario, unidadeController.associarProprietario);

/**
 * @swagger
 * /api/v1/unidades/{id}/proprietario:
 *   delete:
 *     summary: Remover proprietário da unidade
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Proprietário removido com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Unidade não encontrada
 */
router.delete('/:id/proprietario', authMiddleware, isAdmin, validarId, unidadeController.removerProprietario);

module.exports = router;
