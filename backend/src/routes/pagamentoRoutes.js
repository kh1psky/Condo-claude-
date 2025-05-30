// backend/src/routes/pagamentoRoutes.js
const express = require('express');
const { pagamentoController } = require('../controllers');
const { pagamentoSchema, idParam, paginationQuery } = require('../utils/validationSchemas');
const { validate } = require('express-validator');
const { authMiddleware, isAdminOrSindico } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * /pagamentos:
 *   get:
 *     summary: Lista pagamentos com filtros
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: unidade_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, pago, atrasado, cancelado]
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [condominio, extra, multa, outro]
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *       401:
 *         description: Não autenticado
 */
router.get('/', authMiddleware, paginationQuery, validate(), pagamentoController.listarPagamentos);

/**
 * @swagger
 * /pagamentos/{id}:
 *   get:
 *     summary: Busca um pagamento pelo ID
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Dados do pagamento
 *       404:
 *         description: Pagamento não encontrado
 */
router.get('/:id', authMiddleware, idParam, validate(), pagamentoController.buscarPagamento);

/**
 * @swagger
 * /pagamentos:
 *   post:
 *     summary: Cria um novo pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unidade_id
 *               - descricao
 *               - valor
 *               - data_vencimento
 *             properties:
 *               unidade_id:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 enum: [condominio, extra, multa, outro]
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *                 format: float
 *               data_vencimento:
 *                 type: string
 *                 format: date
 *               data_pagamento:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pendente, pago, atrasado, cancelado]
 *               referencia_mes:
 *                 type: integer
 *               referencia_ano:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pagamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Unidade não encontrada
 */
router.post('/', authMiddleware, isAdminOrSindico, pagamentoSchema.create, validate(), pagamentoController.criarPagamento);

/**
 * @swagger
 * /pagamentos/{id}:
 *   put:
 *     summary: Atualiza um pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *                 format: float
 *               data_vencimento:
 *                 type: string
 *                 format: date
 *               data_pagamento:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pendente, pago, atrasado, cancelado]
 *     responses:
 *       200:
 *         description: Pagamento atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Pagamento não encontrado
 */
router.put('/:id', authMiddleware, isAdminOrSindico, idParam, pagamentoSchema.update, validate(), pagamentoController.atualizarPagamento);

/**
 * @swagger
 * /pagamentos/{id}/comprovante:
 *   post:
 *     summary: Adiciona comprovante ao pagamento
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comprovante:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comprovante adicionado com sucesso
 *       400:
 *         description: Arquivo inválido
 *       404:
 *         description: Pagamento não encontrado
 */
router.post('/:id/comprovante', authMiddleware, idParam, uploadSingle('comprovante'), handleMulterError, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }
    
    // Obtém o caminho do arquivo
    const comprovante_url = req.file.path;
    
    // Atualiza o pagamento com o caminho do comprovante
    const pagamento = await Pagamento.findByPk(id);
    
    if (!pagamento) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    await pagamento.update({
      comprovante_url,
      status: 'pago',
      data_pagamento: new Date()
    });
    
    return res.json({
      message: 'Comprovante adicionado com sucesso',
      pagamento
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /pagamentos/{id}:
 *   delete:
 *     summary: Remove um pagamento (soft delete)
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Pagamento removido com sucesso
 *       404:
 *         description: Pagamento não encontrado
 */
router.delete('/:id', authMiddleware, isAdminOrSindico, idParam, validate(), pagamentoController.removerPagamento);

module.exports = router;