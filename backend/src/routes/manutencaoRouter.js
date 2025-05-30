const express = require('express');
const router = express.Router();
const manutencaoController = require('../controllers/manutencaoController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');
const { body, query, param } = require('express-validator');

/**
 * Configurar upload para múltiplos arquivos (fotos, documentos)
 */
const uploadManutencao = uploadMiddleware.array('anexos', 10); // máximo 10 arquivos

/**
 * Validações para criação de manutenção
 */
const validarCriacaoManutencao = [
  body('unidadeId')
    .notEmpty()
    .withMessage('ID da unidade é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da unidade deve ser um número válido'),
  
  body('tipo')
    .notEmpty()
    .withMessage('Tipo é obrigatório')
    .isIn(['PREVENTIVA', 'CORRETIVA', 'EMERGENCIAL', 'REFORMA', 'INSTALACAO'])
    .withMessage('Tipo deve ser: PREVENTIVA, CORRETIVA, EMERGENCIAL, REFORMA ou INSTALACAO'),
  
  body('titulo')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres'),
  
  body('descricao')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('prioridade')
    .optional()
    .isIn(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'])
    .withMessage('Prioridade deve ser: BAIXA, MEDIA, ALTA ou URGENTE'),
  
  body('responsavelId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do responsável deve ser um número válido'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres'),
  
  body('itensInventario')
    .optional()
    .isArray()
    .withMessage('Itens de inventário deve ser um array'),
  
  body('itensInventario.*.inventarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do item de inventário deve ser um número válido'),
  
  body('itensInventario.*.quantidade')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número maior que 0'),
  
  body('itensInventario.*.reduzirEstoque')
    .optional()
    .isBoolean()
    .withMessage('Reduzir estoque deve ser verdadeiro ou falso')
];

/**
 * Validações para atualização de manutenção
 */
const validarAtualizacaoManutencao = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da manutenção deve ser um número válido'),
  
  body('titulo')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres'),
  
  body('descricao')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  
  body('prioridade')
    .optional()
    .isIn(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'])
    .withMessage('Prioridade deve ser: BAIXA, MEDIA, ALTA ou URGENTE'),
  
  body('status')
    .optional()
    .isIn(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECAS', 'FINALIZADA', 'CANCELADA'])
    .withMessage('Status deve ser: ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA ou CANCELADA'),
  
  body('responsavelId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do responsável deve ser um número válido'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres'),
  
  body('dataFinalizacao')
    .optional()
    .isISO8601()
    .withMessage('Data de finalização deve ser uma data válida')
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
  
  query('unidadeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da unidade deve ser um número válido'),
  
  query('condominioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  query('status')
    .optional()
    .isIn(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECAS', 'FINALIZADA', 'CANCELADA'])
    .withMessage('Status deve ser: ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA ou CANCELADA'),
  
  query('prioridade')
    .optional()
    .isIn(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'])
    .withMessage('Prioridade deve ser: BAIXA, MEDIA, ALTA ou URGENTE'),
  
  query('tipo')
    .optional()
    .isIn(['PREVENTIVA', 'CORRETIVA', 'EMERGENCIAL', 'REFORMA', 'INSTALACAO'])
    .withMessage('Tipo deve ser: PREVENTIVA, CORRETIVA, EMERGENCIAL, REFORMA ou INSTALACAO'),
  
  query('responsavelId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do responsável deve ser um número válido'),
  
  query('dataInicio')
    .optional()
    .isISO8601()
    .withMessage('Data início deve ser uma data válida'),
  
  query('dataFim')
    .optional()
    .isISO8601()
    .withMessage('Data fim deve ser uma data válida')
];

/**
 * Validações para atualização de status
 */
const validarAtualizacaoStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da manutenção deve ser um número válido'),
  
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECAS', 'FINALIZADA', 'CANCELADA'])
    .withMessage('Status deve ser: ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA ou CANCELADA'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres')
];

/**
 * Validações para parâmetros ID
 */
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

const validarUnidadeId = [
  param('unidadeId')
    .isInt({ min: 1 })
    .withMessage('ID da unidade deve ser um número válido')
];

const validarAnexoId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da manutenção deve ser um número válido'),
  param('anexoId')
    .isInt({ min: 0 })
    .withMessage('ID do anexo deve ser um número válido')
];

// ===== ROTAS PRINCIPAIS =====

/**
 * @swagger
 * /api/v1/manutencoes:
 *   get:
 *     summary: Listar manutenções
 *     tags: [Manutenções]
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
 *         description: Busca por título, descrição ou observações
 *       - in: query
 *         name: unidadeId
 *         schema:
 *           type: integer
 *         description: Filtrar por unidade
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA, CANCELADA]
 *         description: Filtrar por status
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [BAIXA, MEDIA, ALTA, URGENTE]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [PREVENTIVA, CORRETIVA, EMERGENCIAL, REFORMA, INSTALACAO]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: responsavelId
 *         schema:
 *           type: integer
 *         description: Filtrar por responsável
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
 *     responses:
 *       200:
 *         description: Lista de manutenções
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.get('/', authMiddleware, validarListagem, manutencaoController.listar);

/**
 * @swagger
 * /api/v1/manutencoes:
 *   post:
 *     summary: Criar nova manutenção
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - unidadeId
 *               - tipo
 *               - titulo
 *               - descricao
 *             properties:
 *               unidadeId:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [PREVENTIVA, CORRETIVA, EMERGENCIAL, REFORMA, INSTALACAO]
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               prioridade:
 *                 type: string
 *                 enum: [BAIXA, MEDIA, ALTA, URGENTE]
 *               responsavelId:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *               anexos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               itensInventario:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventarioId:
 *                       type: integer
 *                     quantidade:
 *                       type: integer
 *                     reduzirEstoque:
 *                       type: boolean
 *                     observacoes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Manutenção criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Unidade ou responsável não encontrado
 */
router.post('/', authMiddleware, uploadManutencao, validarCriacaoManutencao, manutencaoController.criar);

/**
 * @swagger
 * /api/v1/manutencoes/{id}:
 *   get:
 *     summary: Buscar manutenção por ID
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da manutenção
 *     responses:
 *       200:
 *         description: Dados da manutenção
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Manutenção não encontrada
 */
router.get('/:id', authMiddleware, validarId, manutencaoController.buscarPorId);

/**
 * @swagger
 * /api/v1/manutencoes/{id}:
 *   put:
 *     summary: Atualizar manutenção
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da manutenção
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               prioridade:
 *                 type: string
 *                 enum: [BAIXA, MEDIA, ALTA, URGENTE]
 *               status:
 *                 type: string
 *                 enum: [ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA, CANCELADA]
 *               responsavelId:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *               dataFinalizacao:
 *                 type: string
 *                 format: date-time
 *               anexos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Manutenção atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Manutenção não encontrada
 */
router.put('/:id', authMiddleware, uploadManutencao, validarAtualizacaoManutencao, manutencaoController.atualizar);

/**
 * @swagger
 * /api/v1/manutencoes/{id}:
 *   delete:
 *     summary: Excluir manutenção
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da manutenção
 *     responses:
 *       200:
 *         description: Manutenção excluída com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Manutenção não encontrada
 *       409:
 *         description: Manutenção não pode ser excluída
 */
router.delete('/:id', authMiddleware, isAdmin, validarId, manutencaoController.excluir);

// ===== ROTAS ESPECÍFICAS =====

/**
 * @swagger
 * /api/v1/manutencoes/unidade/{unidadeId}:
 *   get:
 *     summary: Buscar manutenções por unidade
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da unidade
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA, CANCELADA]
 *         description: Filtrar por status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista de manutenções da unidade
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/unidade/:unidadeId', authMiddleware, validarUnidadeId, manutencaoController.buscarPorUnidade);

/**
 * @swagger
 * /api/v1/manutencoes/{id}/status:
 *   patch:
 *     summary: Atualizar status da manutenção
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da manutenção
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
 *                 enum: [ABERTA, EM_ANDAMENTO, AGUARDANDO_PECAS, FINALIZADA, CANCELADA]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Manutenção não encontrada
 */
router.patch('/:id/status', authMiddleware, validarAtualizacaoStatus, manutencaoController.atualizarStatus);

/**
 * @swagger
 * /api/v1/manutencoes/{id}/anexos/{anexoId}:
 *   get:
 *     summary: Download de anexo da manutenção
 *     tags: [Manutenções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da manutenção
 *       - in: path
 *         name: anexoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Índice do anexo
 *     responses:
 *       200:
 *         description: Download do arquivo
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Manutenção ou anexo não encontrado
 */
router.get('/:id/anexos/:anexoId', authMiddleware, validarAnexoId, manutencaoController.downloadAnexo);

module.exports = router;