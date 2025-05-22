// backend/src/routes/relatoriosRoutes.js
const express = require('express');
const { relatoriosController } = require('../controllers');
const { validate } = require('express-validator');
const { authMiddleware, isAdminOrSindico } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /relatorios/financeiro:
 *   get:
 *     summary: Gera relatório financeiro
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *         required: true
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
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [receitas, despesas, completo]
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/financeiro', authMiddleware, isAdminOrSindico, validate(), relatoriosController.relatorioFinanceiro);

/**
 * @swagger
 * /relatorios/inadimplencia:
 *   get:
 *     summary: Gera relatório de inadimplência
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/inadimplencia', authMiddleware, isAdminOrSindico, validate(), relatoriosController.relatorioInadimplencia);

/**
 * @swagger
 * /relatorios/manutencoes:
 *   get:
 *     summary: Gera relatório de manutenções
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [solicitada, aprovada, em_andamento, concluida, cancelada]
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
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/manutencoes', authMiddleware, isAdminOrSindico, validate(), relatoriosController.relatorioManutencoes);

/**
 * @swagger
 * /relatorios/contratos:
 *   get:
 *     summary: Gera relatório de contratos
 *     tags: [Relatórios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: condominio_id
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [vigente, encerrado, cancelado, em_analise]
 *       - in: query
 *         name: vencendo
 *         schema:
 *           type: integer
 *           description: Dias para vencimento
 *     responses:
 *       200:
 *         description: Relatório gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Condomínio não encontrado
 */
router.get('/contratos', authMiddleware, isAdminOrSindico, validate(), relatoriosController.relatorioContratos);

module.exports = router;