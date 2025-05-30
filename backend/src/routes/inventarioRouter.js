const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

/**
 * Validações para criação de item do inventário
 */
const validarCriacaoItem = [
  body('condominioId')
    .notEmpty()
    .withMessage('ID do condomínio é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  
  body('categoria')
    .optional()
    .isIn(['LIMPEZA', 'MANUTENCAO', 'FERRAMENTAS', 'ELETRICOS', 'HIDRAULICOS', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'GERAL'])
    .withMessage('Categoria deve ser válida'),
  
  body('unidade')
    .optional()
    .isIn(['UNIDADE', 'KG', 'LITRO', 'METRO', 'METRO2', 'METRO3', 'CAIXA', 'PACOTE', 'ROLO'])
    .withMessage('Unidade deve ser válida'),
  
  body('quantidade')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número não negativo'),
  
  body('estoqueMinimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque mínimo deve ser um número não negativo'),
  
  body('valorUnitario')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor unitário deve ser um número decimal válido'),
  
  body('fornecedor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Fornecedor deve ter no máximo 100 caracteres'),
  
  body('localizacao')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Localização deve ter no máximo 200 caracteres'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações deve ter no máximo 1000 caracteres')
];

/**
 * Validações para atualização de item do inventário
 */
const validarAtualizacaoItem = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do item deve ser um número válido'),
  
  body('nome')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('descricao')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  
  body('categoria')
    .optional()
    .isIn(['LIMPEZA', 'MANUTENCAO', 'FERRAMENTAS', 'ELETRICOS', 'HIDRAULICOS', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'GERAL'])
    .withMessage('Categoria deve ser válida'),
  
  body('unidade')
    .optional()
    .isIn(['UNIDADE', 'KG', 'LITRO', 'METRO', 'METRO2', 'METRO3', 'CAIXA', 'PACOTE', 'ROLO'])
    .withMessage('Unidade deve ser válida'),
  
  body('quantidade')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número não negativo'),
  
  body('estoqueMinimo')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque mínimo deve ser um número não negativo'),
  
  body('valorUnitario')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Valor unitário deve ser um número decimal válido'),
  
  body('fornecedor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Fornecedor deve ter no máximo 100 caracteres'),
  
  body('localizacao')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Localização deve ter no máximo 200 caracteres'),
  
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
  
  query('condominioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido'),
  
  query('categoria')
    .optional()
    .isIn(['LIMPEZA', 'MANUTENCAO', 'FERRAMENTAS', 'ELETRICOS', 'HIDRAULICOS', 'SEGURANCA', 'JARDINAGEM', 'MATERIAIS', 'EQUIPAMENTOS', 'GERAL'])
    .withMessage('Categoria deve ser válida'),
  
  query('status')
    .optional()
    .isIn(['ATIVO', 'INATIVO'])
    .withMessage('Status deve ser ATIVO ou INATIVO'),
  
  query('estoqueMinimo')
    .optional()
    .isBoolean()
    .withMessage('Estoque mínimo deve ser verdadeiro ou falso'),
  
  query('ordenarPor')
    .optional()
    .isIn(['nome', 'quantidade', 'categoria', 'valor', 'dataAtualizacao'])
    .withMessage('Ordenar por deve ser: nome, quantidade, categoria, valor ou dataAtualizacao')
];

/**
 * Validações para atualização de estoque
 */
const validarAtualizacaoEstoque = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do item deve ser um número válido'),
  
  body('tipo')
    .notEmpty()
    .withMessage('Tipo de movimentação é obrigatório')
    .isIn(['ENTRADA', 'SAIDA', 'AJUSTE'])
    .withMessage('Tipo deve ser: ENTRADA, SAIDA ou AJUSTE'),
  
  body('quantidade')
    .notEmpty()
    .withMessage('Quantidade é obrigatória')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número maior que 0'),
  
  body('observacoes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Observações deve ter no máximo 500 caracteres')
];

/**
 * Validações para parâmetros
 */
const validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido')
];

const validarRelatorio = [
  query('condominioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do condomínio deve ser um número válido')
];

// ===== ROTAS PRINCIPAIS =====

/**
 * @swagger
 * /api/v1/inventario:
 *   get:
 *     summary: Listar itens do inventário
 *     tags: [Inventário]
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
 *         description: Busca por nome, descrição, categoria ou fornecedor
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [LIMPEZA, MANUTENCAO, FERRAMENTAS, ELETRICOS, HIDRAULICOS, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, GERAL]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ATIVO, INATIVO]
 *         description: Filtrar por status
 *       - in: query
 *         name: estoqueMinimo
 *         schema:
 *           type: boolean
 *         description: Filtrar itens abaixo do estoque mínimo
 *       - in: query
 *         name: ordenarPor
 *         schema:
 *           type: string
 *           enum: [nome, quantidade, categoria, valor, dataAtualizacao]
 *         description: Campo para ordenação
 *     responses:
 *       200:
 *         description: Lista de itens do inventário
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 */
router.get('/', authMiddleware, validarListagem, inventarioController.listar);

/**
 * @swagger
 * /api/v1/inventario:
 *   post:
 *     summary: Criar novo item no inventário
 *     tags: [Inventário]
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
 *               - nome
 *             properties:
 *               condominioId:
 *                 type: integer
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [LIMPEZA, MANUTENCAO, FERRAMENTAS, ELETRICOS, HIDRAULICOS, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, GERAL]
 *               unidade:
 *                 type: string
 *                 enum: [UNIDADE, KG, LITRO, METRO, METRO2, METRO3, CAIXA, PACOTE, ROLO]
 *               quantidade:
 *                 type: integer
 *               estoqueMinimo:
 *                 type: integer
 *               valorUnitario:
 *                 type: number
 *               fornecedor:
 *                 type: string
 *               localizacao:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Condomínio não encontrado
 *       409:
 *         description: Item já existe
 */
router.post('/', authMiddleware, isAdmin, validarCriacaoItem, inventarioController.criar);

/**
 * @swagger
 * /api/v1/inventario/{id}:
 *   get:
 *     summary: Buscar item por ID
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item
 *     responses:
 *       200:
 *         description: Dados do item
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Item não encontrado
 */
router.get('/:id', authMiddleware, validarId, inventarioController.buscarPorId);

/**
 * @swagger
 * /api/v1/inventario/{id}:
 *   put:
 *     summary: Atualizar item do inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [LIMPEZA, MANUTENCAO, FERRAMENTAS, ELETRICOS, HIDRAULICOS, SEGURANCA, JARDINAGEM, MATERIAIS, EQUIPAMENTOS, GERAL]
 *               unidade:
 *                 type: string
 *                 enum: [UNIDADE, KG, LITRO, METRO, METRO2, METRO3, CAIXA, PACOTE, ROLO]
 *               quantidade:
 *                 type: integer
 *               estoqueMinimo:
 *                 type: integer
 *               valorUnitario:
 *                 type: number
 *               fornecedor:
 *                 type: string
 *               localizacao:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Item não encontrado
 *       409:
 *         description: Nome já existe
 */
router.put('/:id', authMiddleware, isAdmin, validarAtualizacaoItem, inventarioController.atualizar);

/**
 * @swagger
 * /api/v1/inventario/{id}:
 *   delete:
 *     summary: Excluir item do inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item
 *     responses:
 *       200:
 *         description: Item excluído com sucesso
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Item não encontrado
 *       409:
 *         description: Item possui dependências
 */
router.delete('/:id', authMiddleware, isAdmin, validarId, inventarioController.excluir);

// ===== ROTAS ESPECÍFICAS =====

/**
 * @swagger
 * /api/v1/inventario/categorias:
 *   get:
 *     summary: Listar categorias disponíveis
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 *       401:
 *         description: Token inválido
 */
router.get('/categorias', authMiddleware, inventarioController.listarCategorias);

/**
 * @swagger
 * /api/v1/inventario/estoque/baixo:
 *   get:
 *     summary: Listar itens com estoque baixo
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *     responses:
 *       200:
 *         description: Lista de itens com estoque baixo
 *       401:
 *         description: Token inválido
 */
router.get('/estoque/baixo', authMiddleware, inventarioController.estoqueBaixo);

/**
 * @swagger
 * /api/v1/inventario/relatorio/estoque:
 *   get:
 *     summary: Relatório de estoque
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominioId
 *         schema:
 *           type: integer
 *         description: Filtrar por condomínio
 *     responses:
 *       200:
 *         description: Relatório de estoque com estatísticas
 *       401:
 *         description: Token inválido
 */
router.get('/relatorio/estoque', authMiddleware, validarRelatorio, inventarioController.relatorioEstoque);

/**
 * @swagger
 * /api/v1/inventario/{id}/estoque:
 *   patch:
 *     summary: Atualizar estoque do item
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - quantidade
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [ENTRADA, SAIDA, AJUSTE]
 *               quantidade:
 *                 type: integer
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou quantidade insuficiente
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Item não encontrado
 */
router.patch('/:id/estoque', authMiddleware, isAdmin, validarAtualizacaoEstoque, inventarioController.atualizarEstoque);

module.exports = router; f